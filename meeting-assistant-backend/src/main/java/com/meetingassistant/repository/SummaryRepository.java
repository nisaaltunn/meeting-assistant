
package com.meetingassistant.repository;

import com.meetingassistant.entity.Summary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SummaryRepository extends JpaRepository<Summary, Long> {

    Optional<Summary> findByMeeting_Id(Long meetingId);
}
