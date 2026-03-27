package com.oficina.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oficina.dto.OwnerRequestDTO;
import com.oficina.entities.Owner;
import com.oficina.repositories.OwnerRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("owners")
public class OwnerController {

    @Autowired
    private OwnerRepository repository;

    @PostMapping
    public ResponseEntity<Owner> create(@RequestBody @Valid OwnerRequestDTO data) {
        Owner owner = new Owner();
        owner.setName(data.name());
        owner.setPhone(data.phone());
        owner.setCpf(data.cpf());
        owner.setEmail(data.email());
        
        return ResponseEntity.ok(repository.save(owner));
    }

    @GetMapping
    public ResponseEntity<List<Owner>> listAll() {
        return ResponseEntity.ok(repository.findAll());
    }
}