package com.oficina.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oficina.dto.OrderRequestDTO;
import com.oficina.entities.ServiceOrder;
import com.oficina.entities.User;
import com.oficina.entities.Vehicle;
import com.oficina.repositories.OrderRepository;
import com.oficina.repositories.UserRepository;
import com.oficina.repositories.VehicleRepository;

import jakarta.validation.Valid;

/**
 * Controlador REST para gerenciar as ordens de serviço da oficina. Ele expõe endpoints para criar novas ordens
 */
@RestController
@RequestMapping("orders")
public class OrderController {

    @Autowired
    private OrderRepository repository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody @Valid OrderRequestDTO data) {
        // Busca o veículo pelo ID que veio do DTO
        Vehicle vehicle = vehicleRepository.findById(data.vehicleId())
                .orElseThrow(() -> new RuntimeException("Veículo não encontrado"));

        User mechanic = userRepository.findById(data.responsibleId())
                .orElseThrow(() -> new RuntimeException("Mecânico responsável não encontrado"));

        if (!mechanic.isMechanic()) {
            return ResponseEntity.badRequest().body("O responsável informado não está marcado como mecânico.");
        }

        // Monta a Ordem de Serviço vinculando os objetos completos
        ServiceOrder order = new ServiceOrder();
        order.setVehicle(vehicle);
        order.setDescription(data.description());
        order.setResponsible(mechanic); // Passa o objeto 'User' encontrado

        // Salva e retorna
        ServiceOrder savedOrder = repository.save(order);
        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping
    public ResponseEntity<List<ServiceOrder>> listAll() {
        // Retorna todas as ordens com os dados de veículo e mecânico inclusos
        return ResponseEntity.ok(repository.findAll());
    }
}
