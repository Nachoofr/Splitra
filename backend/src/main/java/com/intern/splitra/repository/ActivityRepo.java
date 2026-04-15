package com.intern.splitra.repository;

import com.intern.splitra.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepo extends JpaRepository<Activity, Long> {
    List<Activity> findAllByGroupIdOrderByCreatedAtDesc(Long groupId);

    @Query("SELECT a FROM Activity a WHERE a.group IN " +
            "(SELECT g FROM Groups g JOIN g.members m WHERE m.id = :userId) " +
            "ORDER BY a.createdAt DESC")
    List<Activity> findAllActivitiesForUser(@Param("userId") Long userId);
}