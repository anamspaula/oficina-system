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

import com.oficina.dto.OwnerRequestDTO;
import com.oficina.dto.OwnerUpdateDTO;
import com.oficina.entities.Owner;
import com.oficina.repositories.OwnerRepository;

import jakarta.validation.Valid;

/**
 * Controlador para gerenciar os proprietários dos veículos. Ele fornece endpoints para criar, listar e atualizar os proprietários.
 */
@RestController
@RequestMapping("owners")
public class OwnerController {

    @Autowired
    private OwnerRepository repository;

    /**
     * Cria um novo proprietário com base nos dados fornecidos. O método espera um objeto OwnerRequestDTO no corpo da requisição, 
     * que contém as informações necessárias para criar um proprietário. Ele retorna o proprietário criado como resposta.
     * @param data Objeto OwnerRequestDTO contendo os dados do proprietário a ser criado.
     * @return ResponseEntity<Owner>
     */
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

    /**
     * Atualiza um proprietário existente com base no ID fornecido e nos dados de atualização. 
     * O método espera um UUID como parâmetro de caminho para identificar o proprietário a ser atualizado,
     * @param id UUID do proprietário a ser atualizado.
     * @param data Objeto OwnerUpdateDTO contendo os dados de atualização do proprietário.
     * @return ResponseEntity<Owner>
     */
    @PutMapping("/{id}")
    public ResponseEntity<Owner> updateOwner(
        @PathVariable UUID id, 
        @RequestBody @Valid OwnerUpdateDTO data) {
    
        Owner owner = repository.findById(id).orElseThrow(() -> new RuntimeException("Proprietário não encontrado com o ID: " + id));

        // Atualiza os campos
        owner.setName(data.name());
        owner.setPhone(data.phone());
        owner.setCpf(data.cpf());
        owner.setEmail(data.email());

        Owner updatedOwner = repository.save(owner);

        return ResponseEntity.ok(updatedOwner);
    }
}