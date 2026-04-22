package com.intern.splitra.service;

import com.intern.splitra.config.EsewaConfig;
import com.intern.splitra.dto.EsewaVerifyDto;
import com.intern.splitra.enums.PaymentMethod;
import com.intern.splitra.enums.SettlementStatus;
import com.intern.splitra.model.Groups;
import com.intern.splitra.model.Settlement;
import com.intern.splitra.model.User;
import com.intern.splitra.repository.SettlementRepo;
import com.intern.splitra.service.implementation.EsewaServiceImpl;
import com.intern.splitra.util.GroupUtil;
import com.intern.splitra.util.SettlementUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EsewaServiceTest {

    @Mock private SettlementRepo settlementRepo;
    @Mock private EsewaConfig esewaConfig;
    @Mock private RestTemplate restTemplate;
    @Mock private SettlementUtil settlementUtil;
    @Mock private GroupUtil groupUtil;

    @InjectMocks
    private EsewaServiceImpl esewaService;

    private Settlement pendingSettlement;
    private EsewaVerifyDto verifyDto;

    @BeforeEach
    void setUp() {
        User fromUser = new User();
        fromUser.setId(1L);

        User toUser = new User();
        toUser.setId(2L);

        Groups group = new Groups();
        group.setId(10L);

        pendingSettlement = new Settlement();
        pendingSettlement.setId(100L);
        pendingSettlement.setFromUser(fromUser);
        pendingSettlement.setToUser(toUser);
        pendingSettlement.setGroup(group);
        pendingSettlement.setAmount(500.0);
        pendingSettlement.setStatus(SettlementStatus.PENDING);
        pendingSettlement.setPaymentMethod(PaymentMethod.ESEWA);
        pendingSettlement.setTransactionId("txn-uuid-abc");
        pendingSettlement.setCreatedAt(LocalDateTime.now());

        verifyDto = new EsewaVerifyDto();
        verifyDto.setProductCode("EPAYTEST");
        verifyDto.setTransactionUuid("txn-uuid-abc");
        verifyDto.setTotalAmount("500.0");
    }


    @Test
    void verifyPayment_WhenSettlementNotFound_ShouldThrow() {
        when(settlementRepo.findByTransactionId("txn-uuid-abc")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> esewaService.verifyPayment(verifyDto));

        assertTrue(ex.getMessage().contains("Settlement not found"));
    }

    @Test
    void verifyPayment_WhenSettlementAlreadyConfirmed_ShouldThrow() {
        pendingSettlement.setStatus(SettlementStatus.CONFIRMED);
        when(settlementRepo.findByTransactionId("txn-uuid-abc")).thenReturn(Optional.of(pendingSettlement));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> esewaService.verifyPayment(verifyDto));

        assertTrue(ex.getMessage().contains("Settlement already processed"));
    }

    @Test
    void verifyPayment_WhenEsewaReturnsNullBody_ShouldThrow() {
        when(settlementRepo.findByTransactionId("txn-uuid-abc")).thenReturn(Optional.of(pendingSettlement));

        ResponseEntity<Map> emptyResponse = new ResponseEntity<>((HttpHeaders) null, HttpStatus.OK);
        when(restTemplate.getForEntity(anyString(), eq(Map.class))).thenReturn(emptyResponse);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> esewaService.verifyPayment(verifyDto));

        assertTrue(ex.getMessage().contains("empty response"));
    }

    @Test
    void verifyPayment_WhenEsewaStatusNotComplete_ShouldThrow() {
        when(settlementRepo.findByTransactionId("txn-uuid-abc")).thenReturn(Optional.of(pendingSettlement));

        Map<String, Object> body = new HashMap<>();
        body.put("status", "PENDING");
        ResponseEntity<Map> response = new ResponseEntity<>(body, HttpStatus.OK);
        when(restTemplate.getForEntity(anyString(), eq(Map.class))).thenReturn(response);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> esewaService.verifyPayment(verifyDto));

        assertTrue(ex.getMessage().contains("Payment not completed"));
        assertTrue(ex.getMessage().contains("PENDING"));
    }

    @Test
    void verifyPayment_WhenAmountMismatch_ShouldThrow() {
        verifyDto.setTotalAmount("999.0");
        when(settlementRepo.findByTransactionId("txn-uuid-abc")).thenReturn(Optional.of(pendingSettlement));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> esewaService.verifyPayment(verifyDto));

        assertTrue(ex.getMessage().contains("Amount mismatch"));
    }

    @Test
    void verifyPayment_WhenAllValid_ShouldConfirmSettlement() {
        when(settlementRepo.findByTransactionId("txn-uuid-abc")).thenReturn(Optional.of(pendingSettlement));

        Map<String, Object> body = new HashMap<>();
        body.put("status", "COMPLETE");
        ResponseEntity<Map> response = new ResponseEntity<>(body, HttpStatus.OK);
        when(restTemplate.getForEntity(anyString(), eq(Map.class))).thenReturn(response);
        when(settlementRepo.save(any(Settlement.class))).thenReturn(pendingSettlement);
        doNothing().when(groupUtil).groupStatusUpdate(10L);

        ResponseEntity<Void> result = esewaService.verifyPayment(verifyDto);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(SettlementStatus.CONFIRMED, pendingSettlement.getStatus());
        assertNotNull(pendingSettlement.getConfirmedAt());
        verify(settlementRepo).save(pendingSettlement);
        verify(groupUtil).groupStatusUpdate(10L);
    }

    @Test
    void verifyPayment_WhenInvalidTotalAmountFormat_ShouldThrow() {
        verifyDto.setTotalAmount("not-a-number");
        when(settlementRepo.findByTransactionId("txn-uuid-abc")).thenReturn(Optional.of(pendingSettlement));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> esewaService.verifyPayment(verifyDto));

        assertTrue(ex.getMessage().contains("Invalid totalAmount"));
    }
}