package com.intern.splitra.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class QrCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String label;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String qrImageData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
