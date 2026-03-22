package com.intern.splitra.repository;

import com.intern.splitra.enums.PaymentMethod;
import com.intern.splitra.enums.SettlementStatus;
import com.intern.splitra.model.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SettlementRepo extends JpaRepository<Settlement, Long> {
    List<Settlement> findByGroupIdAndStatus(Long groupId, SettlementStatus settlementStatus);
    List<Settlement> findByToUserIdAndStatus(Long userId, SettlementStatus settlementStatus);
    Optional<Settlement> findByTransactionId(String transactionUuid);
    Optional<Settlement> findByGroupIdAndFromUserIdAndToUserIdAndAmountAndPaymentMethod(long groupId, long fromUserId, long toUserId, Double amount, PaymentMethod paymentMethod);
}
