package com.oficina.entities;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vehicles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String licensePlate;
    private String brand;
    private String model;
    private Integer year;

    // Esta é a contraparte da relação que está no Owner
    @ManyToOne
    @JoinColumn(name = "owner_id")
    private Owner owner;

    // Se você quiser rastrear quem cadastrou:
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User createdBy;
}
