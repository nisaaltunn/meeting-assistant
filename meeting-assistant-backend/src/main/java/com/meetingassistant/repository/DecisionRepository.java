package com.meetingassistant.repository;

import com.meetingassistant.entity.Decision;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DecisionRepository extends JpaRepository<Decision, Long> {
}