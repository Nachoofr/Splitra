package com.intern.splitra.model;

import enums.GroupStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Data
@EqualsAndHashCode(exclude = {"members", "createdBy"})
@ToString(exclude = {"members", "createdBy"})
public class Groups {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String groupName;

    private String groupPicture;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupStatus Status;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    // group members
    @ManyToMany
    @JoinTable(
            name = "group_members",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();


//    @Column(unique = true, nullable = false)
//    private String inviteToken;
//
//    @PrePersist
//    public void generateInviteToken() {
//        if (this.inviteToken == null) {
//            this.inviteToken = UUID.randomUUID().toString();
//        }

}
