package com.pm.adminservice.repository;

import com.pm.adminservice.model.SportsCenterApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SportsCenterApplicationRepository
	extends JpaRepository<SportsCenterApplication, Long>, JpaSpecificationExecutor<SportsCenterApplication> {
}
