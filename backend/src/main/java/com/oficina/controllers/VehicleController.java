package com.oficina.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oficina.dto.VehicleRequestDTO;
import com.oficina.dto.VehicleUpdateDTO;
import com.oficina.entities.Owner;
import com.oficina.entities.Vehicle;
import com.oficina.repositories.OwnerRepository;
import com.oficina.repositories.VehicleRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("vehicles")
public class VehicleController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @PostMapping

    public ResponseEntity<Vehicle> createVehicle(@RequestBody @Valid VehicleRequestDTO data) {
    
    Owner owner = ownerRepository.findById(data.ownerId())
            .orElseThrow(() -> new RuntimeException("Proprietário não encontrado"));

    Vehicle newVehicle = new Vehicle();
    newVehicle.setBrand(data.brand());
    newVehicle.setModel(data.model());
    newVehicle.setLicensePlate(data.licensePlate());
    newVehicle.setYear(data.year());
    newVehicle.setOwner(owner);
    newVehicle.setUserId(data.userId());
    Vehicle savedVehicle = vehicleRepository.save(newVehicle);
    
    return ResponseEntity.ok(savedVehicle);
}

    @GetMapping
    public ResponseEntity<List<Vehicle>> listAll() {
        return ResponseEntity.ok(vehicleRepository.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(
        @PathVariable UUID id, 
        @RequestBody @Valid VehicleUpdateDTO data) {

        // Busca o veículo atual
        Vehicle vehicle = vehicleRepository.findById(id).orElseThrow(() -> new RuntimeException("Veículo não encontrado"));

        // Busca o proprietário
        Owner owner = ownerRepository.findById(data.ownerId()).orElseThrow(() -> new RuntimeException("Proprietário não encontrado"));

        // Atualiza os dados da entidade
        vehicle.setBrand(data.brand());
        vehicle.setModel(data.model());
        vehicle.setLicensePlate(data.licensePlate());
        vehicle.setYear(data.year());
        vehicle.setOwner(owner);

        // Salva
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);

        return ResponseEntity.ok(updatedVehicle);
    }
}
