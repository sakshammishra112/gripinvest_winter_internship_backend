package com.MiniInvest.InvestApp.controller;

import com.MiniInvest.InvestApp.entity.InvestmentProduct;
import com.MiniInvest.InvestApp.service.InvestmentPrd.InvestmentProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class InvestmentProductController {

    private final InvestmentProductService productService;

    public InvestmentProductController(InvestmentProductService productService) {
        this.productService = productService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<InvestmentProduct> createProduct(@RequestBody InvestmentProduct product) {
        return ResponseEntity.ok(productService.createProduct(product));
    }

    @GetMapping
    public ResponseEntity<List<InvestmentProduct>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvestmentProduct> getProductById(@PathVariable String id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<InvestmentProduct> updateProduct(
            @PathVariable String id,
            @RequestBody InvestmentProduct updatedProduct
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, updatedProduct));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recommend/{risk}")
    public ResponseEntity<String> recommendProducts(@PathVariable String risk) {
        return ResponseEntity.ok(productService.recommendProducts(risk));
    }

    @GetMapping("getIdbyname/{name}")
    public ResponseEntity<String> getIdByName(@PathVariable String name) {
        return ResponseEntity.ok(productService.getIdByName(name));
    }

}

