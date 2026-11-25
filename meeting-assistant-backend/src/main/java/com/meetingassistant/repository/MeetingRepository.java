
package com.meetingassistant.repository;

import com.meetingassistant.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    List<Meeting> findAllByUserId(Long userId);

    Optional<Meeting> findFirstByUser_IdAndTitleIgnoreCase(
            Long userId,
            String title
    );
}
