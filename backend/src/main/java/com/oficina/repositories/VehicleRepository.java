package com.oficina.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.oficina.entities.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    boolean existsByLicensePlate(String licensePlate);
}
