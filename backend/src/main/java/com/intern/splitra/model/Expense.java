package com.intern.splitra.model;

import com.intern.splitra.enums.SplitMethod;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Data
@EqualsAndHashCode(exclude = {"paidBy", "group", "splits"})
@ToString(exclude = {"paidBy", "group", "splits"})
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank
    @Column(nullable = false)
    private String description;

    @NotNull
    @Column(nullable = false)
    private double amount;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime date;

    @ManyToOne
    private Category category;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ExpensePayment> paidBy = new HashSet<>();

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ExpenseSplit> splits = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SplitMethod splitMethod;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Groups group;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull
    private User createdBy;

}
