package com.intern.splitra.repository;

import com.intern.splitra.model.Groups;
import com.intern.splitra.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepo extends JpaRepository<Groups, Long> {
    List<Groups> findGroupsByMembersId(long userId);
//    Optional<Groups> findByInviteToken(String inviteToken);

}
