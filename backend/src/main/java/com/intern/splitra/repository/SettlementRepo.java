package com.intern.splitra.repository;

import com.intern.splitra.enums.SettlementStatus;
import com.intern.splitra.model.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SettlementRepo extends JpaRepository<Settlement, Long> {
    List<Settlement> findByGroupIdAndStatus(Long groupId, SettlementStatus settlementStatus);
}
