package com.intern.splitra.repository;

import com.intern.splitra.model.Groups;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRepo extends JpaRepository<Groups, Long> {
}
