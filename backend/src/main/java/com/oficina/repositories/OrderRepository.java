package com.oficina.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.oficina.entities.ServiceOrder;

public interface OrderRepository extends JpaRepository<ServiceOrder, UUID> {
}
