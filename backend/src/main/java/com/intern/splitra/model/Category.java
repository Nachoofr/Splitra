package com.intern.splitra.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class Category {
    @Id
    private long id;

    private String name;
}
