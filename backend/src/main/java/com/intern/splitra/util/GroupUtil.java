package com.intern.splitra.util;

import com.intern.splitra.dto.BalanceDto;
import com.intern.splitra.model.Groups;
import com.intern.splitra.repository.GroupRepo;
import com.intern.splitra.repository.SettlementRepo;
import com.intern.splitra.repository.UserRepo;
import com.intern.splitra.service.BalanceService;
import enums.GroupStatus;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@AllArgsConstructor
public class GroupUtil {
    private final GroupRepo groupRepo;
    private final BalanceService balanceService;

    public void groupStatusUpdate(long groupId) {
        Groups group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        List<BalanceDto> balances = balanceService
                .getGroupBalance(groupId)
                .getBody();

        if (balances == null || balances.isEmpty()) {
            group.setStatus(GroupStatus.CREATED);
            groupRepo.save(group);
            return;
        }

        boolean allSettled = balances.stream()
                .allMatch(b -> Math.abs(b.getBalance()) < 0.01);

        if (allSettled) {
            group.setStatus(GroupStatus.SETTLED);
        } else {
            group.setStatus(GroupStatus.UNSETTLED);
        }

        groupRepo.save(group);


    }
}
