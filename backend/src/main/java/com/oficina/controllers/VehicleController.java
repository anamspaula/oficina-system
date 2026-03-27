package com.oficina.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oficina.dto.VehicleRequestDTO;
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
}
