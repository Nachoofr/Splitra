package com.intern.splitra.service;

import com.intern.splitra.dto.ItemDto;
import com.intern.splitra.dto.ItemSplitEntryDto;
import com.intern.splitra.mapper.ExpenseSplitMapper;
import com.intern.splitra.model.Expense;
import com.intern.splitra.model.ExpenseSplit;
import com.intern.splitra.model.Groups;
import com.intern.splitra.model.User;
import com.intern.splitra.repository.ExpenseRepo;
import com.intern.splitra.repository.ExpenseSplitRepo;
import com.intern.splitra.repository.UserRepo;
import com.intern.splitra.service.implementation.ExpenseSplitServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseSplitServiceTest {

    @Mock private ExpenseSplitRepo expenseSplitRepo;
    @Mock private UserRepo userRepo;
    @Mock private ExpenseRepo expenseRepo;
    @Mock private ExpenseSplitMapper expenseSplitMapper;

    @InjectMocks
    private ExpenseSplitServiceImpl expenseSplitService;

    private User userA;
    private User userB;
    private Groups group;
    private Expense expense;

    @BeforeEach
    void setUp() {
        userA = new User();
        userA.setId(1L);
        userA.setFullName("Alice");

        userB = new User();
        userB.setId(2L);
        userB.setFullName("Bob");

        Set<User> members = new HashSet<>(Arrays.asList(userA, userB));

        group = new Groups();
        group.setId(10L);
        group.setMembers(members);

        expense = new Expense();
        expense.setId(100L);
        expense.setAmount(200.0);
        expense.setGroup(group);
    }


    @Test
    void itemwiseSplit_WhenEntriesNull_ShouldThrow() {
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseSplitService.itemwiseSplit(100L, null, List.of(), 1L));

        assertEquals("Item split entries cannot be empty", ex.getMessage());
    }

    @Test
    void itemwiseSplit_WhenEntriesEmpty_ShouldThrow() {
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseSplitService.itemwiseSplit(100L, Collections.emptyList(), List.of(new ItemDto()), 1L));

        assertEquals("Item split entries cannot be empty", ex.getMessage());
    }

    @Test
    void itemwiseSplit_WhenItemsNull_ShouldThrow() {
        List<ItemSplitEntryDto> entries = List.of(new ItemSplitEntryDto(1L, List.of(0)));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseSplitService.itemwiseSplit(100L, entries, null, 1L));

        assertEquals("Items list cannot be empty", ex.getMessage());
    }

    @Test
    void itemwiseSplit_WhenItemsEmpty_ShouldThrow() {
        List<ItemSplitEntryDto> entries = List.of(new ItemSplitEntryDto(1L, List.of(0)));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseSplitService.itemwiseSplit(100L, entries, Collections.emptyList(), 1L));

        assertEquals("Items list cannot be empty", ex.getMessage());
    }

    @Test
    void itemwiseSplit_WhenExpenseNotFound_ShouldThrow() {
        List<ItemSplitEntryDto> entries = List.of(new ItemSplitEntryDto(1L, List.of(0)));
        List<ItemDto> items = List.of(new ItemDto(0, 100.0));

        when(expenseRepo.findById(999L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseSplitService.itemwiseSplit(999L, entries, items, 1L));

        assertEquals("Expense not found", ex.getMessage());
    }

    @Test
    void itemwiseSplit_WhenItemIndexNotFoundInItems_ShouldThrow() {
        List<ItemSplitEntryDto> entries = List.of(new ItemSplitEntryDto(1L, List.of(99)));
        List<ItemDto> items = List.of(new ItemDto(0, 100.0)); // only index 0

        when(expenseRepo.findById(100L)).thenReturn(Optional.of(expense));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseSplitService.itemwiseSplit(100L, entries, items, 1L));

        assertTrue(ex.getMessage().contains("Item index 99 not found in items list"));
    }


    @Test
    void itemwiseSplit_WhenUserNotMember_ShouldThrow() {
        User stranger = new User();
        stranger.setId(99L);
        stranger.setFullName("Stranger");

        List<ItemSplitEntryDto> entries = List.of(new ItemSplitEntryDto(99L, List.of(0)));
        List<ItemDto> items = List.of(new ItemDto(0, 200.0));

        when(expenseRepo.findById(100L)).thenReturn(Optional.of(expense));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> expenseSplitService.itemwiseSplit(100L, entries, items, 1L));

        assertTrue(ex.getMessage().contains("not a member of the group"));
    }
}