package com.intern.splitra.service;

import com.intern.splitra.dto.ExpenseDto;
import com.intern.splitra.dto.ExpensePaymentDto;
import com.intern.splitra.dto.ExpenseSplitRequestDto;
import com.intern.splitra.enums.SplitMethod;
import com.intern.splitra.mapper.ExpenseMapper;
import com.intern.splitra.model.*;
import com.intern.splitra.repository.CategoryRepo;
import com.intern.splitra.repository.ExpenseRepo;
import com.intern.splitra.repository.GroupRepo;
import com.intern.splitra.repository.UserRepo;
import com.intern.splitra.service.implementation.ExpenseServiceImpl;
import enums.GroupStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock private UserRepo userRepo;
    @Mock private CategoryRepo categoryRepo;
    @Mock private ExpenseRepo expenseRepo;
    @Mock private ExpenseMapper expenseMapper;
    @Mock private GroupRepo groupRepo;
    @Mock private ExpenseSplitService expenseSplitService;
    @Mock private ActivityService activityService;

    @InjectMocks
    private ExpenseServiceImpl expenseService;

    private User creator;
    private User memberB;
    private User outsider;
    private Groups group;
    private Category globalCategory;
    private Category groupCategory;
    private Expense existingExpense;
    private ExpenseDto validExpenseDto;

    @BeforeEach
    void setUp() {
        creator = new User();
        creator.setId(1L);
        creator.setFullName("Alice");

        memberB = new User();
        memberB.setId(2L);
        memberB.setFullName("Bob");

        outsider = new User();
        outsider.setId(99L);
        outsider.setFullName("Outsider");

        Set<User> members = new HashSet<>(Arrays.asList(creator, memberB));

        group = new Groups();
        group.setId(10L);
        group.setGroupName("Test Group");
        group.setStatus(GroupStatus.CREATED);
        group.setMembers(members);

        globalCategory = new Category();
        globalCategory.setId(1L);
        globalCategory.setName("Food");
        globalCategory.setGroup(null);

        groupCategory = new Category();
        groupCategory.setId(2L);
        groupCategory.setName("Custom");
        groupCategory.setGroup(group);

        existingExpense = new Expense();
        existingExpense.setId(100L);
        existingExpense.setDescription("Lunch");
        existingExpense.setAmount(200.0);
        existingExpense.setGroup(group);
        existingExpense.setCreatedBy(creator);
        existingExpense.setCategory(globalCategory);
        existingExpense.setSplitMethod(SplitMethod.EQUALLY);
        existingExpense.setDate(LocalDateTime.now());
        existingExpense.setPaidBy(new HashSet<>());
        existingExpense.setSplits(new HashSet<>());

        ExpensePaymentDto paymentDto = new ExpensePaymentDto();
        paymentDto.setPaidByUserId(1L);
        paymentDto.setAmountPaid(200.0);

        validExpenseDto = new ExpenseDto();
        validExpenseDto.setDescription("Lunch");
        validExpenseDto.setAmount(200.0);
        validExpenseDto.setCategory(1L);
        validExpenseDto.setSplitMethod("EQUALLY");
        validExpenseDto.setPaidBy(Set.of(paymentDto));

        ExpenseSplitRequestDto splitRequest = new ExpenseSplitRequestDto();
        splitRequest.setEqualSplitId(List.of(1L, 2L));
        validExpenseDto.setSplitRequest(splitRequest);
    }


    @Test
    void addExpense_WhenGroupNotFound_ShouldThrow() {
        when(groupRepo.findById(10L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.addExpense(validExpenseDto, 1L, 10L));

        assertEquals("Group not found", ex.getMessage());
        verify(expenseRepo, never()).save(any());
    }

    @Test
    void addExpense_WhenUserNotFound_ShouldThrow() {
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.addExpense(validExpenseDto, 1L, 10L));

        assertEquals("User not found", ex.getMessage());
        verify(expenseRepo, never()).save(any());
    }

    @Test
    void addExpense_WhenCategoryIdNull_ShouldThrow() {
        validExpenseDto.setCategory(null);

        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.addExpense(validExpenseDto, 1L, 10L));

        assertEquals("Category is required", ex.getMessage());
    }

    @Test
    void addExpense_WhenCategoryNotFound_ShouldThrow() {
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        when(categoryRepo.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.addExpense(validExpenseDto, 1L, 10L));

        assertEquals("Category not found", ex.getMessage());
    }

    @Test
    void addExpense_WhenUserNotMemberOfGroup_ShouldThrow() {
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(99L)).thenReturn(Optional.of(outsider));
        when(categoryRepo.findById(1L)).thenReturn(Optional.of(globalCategory));

        validExpenseDto.setCategory(1L);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.addExpense(validExpenseDto, 99L, 10L));

        assertEquals("User is not a member of the group", ex.getMessage());
    }

    @Test
    void addExpense_WhenGroupCategoryBelongsToDifferentGroup_ShouldThrow() {
        Groups otherGroup = new Groups();
        otherGroup.setId(999L);

        Category foreignCategory = new Category();
        foreignCategory.setId(5L);
        foreignCategory.setName("Foreign");
        foreignCategory.setGroup(otherGroup);

        validExpenseDto.setCategory(5L);

        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        when(categoryRepo.findById(5L)).thenReturn(Optional.of(foreignCategory));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.addExpense(validExpenseDto, 1L, 10L));

        assertEquals("Category does not belong to the group", ex.getMessage());
    }

    @Test
    void addExpense_WhenNoPaidByProvided_ShouldThrow() {
        validExpenseDto.setPaidBy(null);

        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        when(categoryRepo.findById(1L)).thenReturn(Optional.of(globalCategory));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.addExpense(validExpenseDto, 1L, 10L));

        assertEquals("At least one person must pay for this expense", ex.getMessage());
    }

    @Test
    void addExpense_WhenPaidByEmpty_ShouldThrow() {
        validExpenseDto.setPaidBy(Collections.emptySet());

        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        when(categoryRepo.findById(1L)).thenReturn(Optional.of(globalCategory));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.addExpense(validExpenseDto, 1L, 10L));

        assertEquals("At least one person must pay for this expense", ex.getMessage());
    }

    @Test
    void addExpense_WhenTotalPaidDoesNotMatchAmount_ShouldThrow() {
        ExpensePaymentDto paymentDto = new ExpensePaymentDto();
        paymentDto.setPaidByUserId(1L);
        paymentDto.setAmountPaid(100.0); // only 100 but expense is 200

        validExpenseDto.setPaidBy(Set.of(paymentDto));

        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        when(categoryRepo.findById(1L)).thenReturn(Optional.of(globalCategory));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.addExpense(validExpenseDto, 1L, 10L));

        assertEquals("Total amount paid must be equal to the expense amount", ex.getMessage());
    }

    @Test
    void addExpense_WhenPayerNotMemberOfGroup_ShouldThrow() {
        ExpensePaymentDto paymentDto = new ExpensePaymentDto();
        paymentDto.setPaidByUserId(99L);
        paymentDto.setAmountPaid(200.0);

        validExpenseDto.setPaidBy(Set.of(paymentDto));

        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        when(categoryRepo.findById(1L)).thenReturn(Optional.of(globalCategory));
        when(userRepo.findById(99L)).thenReturn(Optional.of(outsider));
        when(expenseMapper.toEntity(any(ExpenseDto.class))).thenReturn(existingExpense);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.addExpense(validExpenseDto, 1L, 10L));

        assertEquals("User is not a member of the group", ex.getMessage());
    }

    @Test
    void addExpense_WhenValidData_ShouldSaveAndReturn201() {
        ExpenseDto responseDto = new ExpenseDto();
        responseDto.setDescription("Lunch");
        responseDto.setAmount(200.0);

        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        when(categoryRepo.findById(1L)).thenReturn(Optional.of(globalCategory));
        when(expenseMapper.toEntity(any(ExpenseDto.class))).thenReturn(existingExpense);
        when(expenseRepo.save(any(Expense.class))).thenReturn(existingExpense);
        when(expenseMapper.toDto(any(Expense.class))).thenReturn(responseDto);
        doNothing().when(activityService).logActivity(any(), any(), any(), any(), any(), any());
        when(expenseSplitService.splitExpense(any(), any(), any())).thenReturn(null);

        ResponseEntity<ExpenseDto> response = expenseService.addExpense(validExpenseDto, 1L, 10L);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(expenseRepo).save(any(Expense.class));
        verify(activityService).logActivity(any(), any(), any(), any(), any(), any());
        verify(expenseSplitService).splitExpense(any(), any(), any());
    }


    @Test
    void getExpensesByGroup_WhenGroupNotFound_ShouldThrow() {
        when(groupRepo.findById(10L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.getExpensesByGroup(10L, 1L));

        assertEquals("Group not found", ex.getMessage());
    }

    @Test
    void getExpensesByGroup_WhenUserNotFound_ShouldThrow() {
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.getExpensesByGroup(10L, 1L));

        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void getExpensesByGroup_WhenUserNotMember_ShouldThrow() {
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(99L)).thenReturn(Optional.of(outsider));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.getExpensesByGroup(10L, 99L));

        assertEquals("User is not a member of the group", ex.getMessage());
    }

    @Test
    void getExpensesByGroup_WhenValidMember_ShouldReturnExpenses() {
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        when(expenseRepo.findAllByGroupId(10L)).thenReturn(List.of(existingExpense));
        when(expenseMapper.toDto(existingExpense)).thenReturn(validExpenseDto);

        ResponseEntity<List<ExpenseDto>> response = expenseService.getExpensesByGroup(10L, 1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }


    @Test
    void getTotalExpenseByGroup_WhenGroupNotFound_ShouldThrow() {
        when(groupRepo.findById(10L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.getTotalExpenseByGroup(10L, 1L));

        assertEquals("Group not found", ex.getMessage());
    }

    @Test
    void getTotalExpenseByGroup_WhenUserNotMember_ShouldThrow() {
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(99L)).thenReturn(Optional.of(outsider));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.getTotalExpenseByGroup(10L, 99L));

        assertEquals("User is not a member of the group", ex.getMessage());
    }

    @Test
    void getTotalExpenseByGroup_WhenValidMember_ShouldReturnSum() {
        Expense e2 = new Expense();
        e2.setAmount(300.0);

        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        when(expenseRepo.findAllByGroupId(10L)).thenReturn(List.of(existingExpense, e2));

        ResponseEntity<Double> response = expenseService.getTotalExpenseByGroup(10L, 1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(500.0, response.getBody());
    }


    @Test
    void deleteExpense_WhenExpenseNotFound_ShouldThrow() {
        when(expenseRepo.findById(100L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.deleteExpense(10L, 1L, 100L));

        assertEquals("Expense not found", ex.getMessage());
    }

    @Test
    void deleteExpense_WhenUserNotMember_ShouldThrow() {
        when(expenseRepo.findById(100L)).thenReturn(Optional.of(existingExpense));
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(99L)).thenReturn(Optional.of(outsider));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.deleteExpense(10L, 99L, 100L));

        assertEquals("User is not a member of the group", ex.getMessage());
        verify(expenseRepo, never()).delete(any());
    }

    @Test
    void deleteExpense_WhenExpenseBelongsToDifferentGroup_ShouldThrow() {
        Groups otherGroup = new Groups();
        otherGroup.setId(999L);
        Set<User> members = new HashSet<>(Arrays.asList(creator));
        otherGroup.setMembers(members);

        existingExpense.setGroup(otherGroup);

        when(expenseRepo.findById(100L)).thenReturn(Optional.of(existingExpense));
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.deleteExpense(10L, 1L, 100L));

        assertEquals("Expense does not belong to this group", ex.getMessage());
    }

    @Test
    void deleteExpense_WhenNotCreator_ShouldThrow() {
        when(expenseRepo.findById(100L)).thenReturn(Optional.of(existingExpense));
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(2L)).thenReturn(Optional.of(memberB));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.deleteExpense(10L, 2L, 100L));

        assertEquals("Only the creator of the expense can delete it", ex.getMessage());
        verify(expenseRepo, never()).delete(any());
    }

    @Test
    void deleteExpense_WhenCreator_ShouldDeleteAndReturn200() {
        when(expenseRepo.findById(100L)).thenReturn(Optional.of(existingExpense));
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        doNothing().when(expenseRepo).delete(existingExpense);
        doNothing().when(activityService).logActivity(any(), any(), any(), any(), any(), any());

        ResponseEntity<Void> response = expenseService.deleteExpense(10L, 1L, 100L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(expenseRepo).delete(existingExpense);
        verify(activityService).logActivity(any(), any(), any(), any(), any(), any());
    }


    @Test
    void getExpenseById_WhenExpenseNotFound_ShouldThrow() {
        when(expenseRepo.findById(999L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.getExpenseById(999L, 1L));

        assertEquals("Expense not found", ex.getMessage());
    }

    @Test
    void getExpenseById_WhenUserNotMember_ShouldThrow() {
        when(expenseRepo.findById(100L)).thenReturn(Optional.of(existingExpense));
        when(userRepo.findById(99L)).thenReturn(Optional.of(outsider));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.getExpenseById(100L, 99L));

        assertEquals("User is not a member of the group", ex.getMessage());
    }

    @Test
    void getExpenseById_WhenValidMember_ShouldReturnExpense() {
        when(expenseRepo.findById(100L)).thenReturn(Optional.of(existingExpense));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        when(expenseMapper.toDto(existingExpense)).thenReturn(validExpenseDto);

        ResponseEntity<ExpenseDto> response = expenseService.getExpenseById(100L, 1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }


    @Test
    void editExpense_WhenExpenseNotFound_ShouldThrow() {
        when(expenseRepo.findById(100L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.editExpense(10L, 1L, 100L, validExpenseDto));

        assertEquals("Expense not found", ex.getMessage());
    }

    @Test
    void editExpense_WhenNotCreator_ShouldThrow() {
        when(expenseRepo.findById(100L)).thenReturn(Optional.of(existingExpense));
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(2L)).thenReturn(Optional.of(memberB));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.editExpense(10L, 2L, 100L, validExpenseDto));

        assertEquals("Only the creator of the expense can edit it", ex.getMessage());
        verify(expenseRepo, never()).save(any());
    }

    @Test
    void editExpense_WhenCategoryDoesNotBelongToGroup_ShouldThrow() {
        Groups otherGroup = new Groups();
        otherGroup.setId(999L);

        Category foreignCategory = new Category();
        foreignCategory.setId(5L);
        foreignCategory.setName("Foreign");
        foreignCategory.setGroup(otherGroup);

        validExpenseDto.setCategory(5L);

        when(expenseRepo.findById(100L)).thenReturn(Optional.of(existingExpense));
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        when(categoryRepo.findById(5L)).thenReturn(Optional.of(foreignCategory));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.editExpense(10L, 1L, 100L, validExpenseDto));

        assertEquals("Category does not belong to the group", ex.getMessage());
    }

    @Test
    void editExpense_WhenTotalPaidMismatch_ShouldThrow() {
        ExpensePaymentDto payment = new ExpensePaymentDto();
        payment.setPaidByUserId(1L);
        payment.setAmountPaid(50.0);

        validExpenseDto.setPaidBy(Set.of(payment));

        when(expenseRepo.findById(100L)).thenReturn(Optional.of(existingExpense));
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        when(categoryRepo.findById(1L)).thenReturn(Optional.of(globalCategory));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseService.editExpense(10L, 1L, 100L, validExpenseDto));

        assertEquals("Total amount paid must be equal to the expense amount", ex.getMessage());
    }

    @Test
    void editExpense_WhenValid_ShouldUpdateAndReturn200() {
        ExpenseDto responseDto = new ExpenseDto();
        responseDto.setDescription("Updated Lunch");
        responseDto.setAmount(200.0);

        when(expenseRepo.findById(100L)).thenReturn(Optional.of(existingExpense));
        when(groupRepo.findById(10L)).thenReturn(Optional.of(group));
        when(userRepo.findById(1L)).thenReturn(Optional.of(creator));
        when(categoryRepo.findById(1L)).thenReturn(Optional.of(globalCategory));
        when(expenseMapper.update(any(), any())).thenReturn(existingExpense);
        when(expenseRepo.save(any(Expense.class))).thenReturn(existingExpense);
        when(expenseMapper.toDto(any(Expense.class))).thenReturn(responseDto);
        when(expenseSplitService.splitExpense(any(), any(), any())).thenReturn(null);

        ResponseEntity<ExpenseDto> response = expenseService.editExpense(10L, 1L, 100L, validExpenseDto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(expenseRepo).save(existingExpense);
    }
}