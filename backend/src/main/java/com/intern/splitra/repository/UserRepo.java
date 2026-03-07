package com.intern.splitra.repository;

import com.intern.splitra.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    User findByEmail(String email);

    Optional<User> findByIdAndActiveTrue(long id);
}
