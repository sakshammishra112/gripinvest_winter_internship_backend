package com.MiniInvest.InvestApp.service.InvestmentPrd;

import com.MiniInvest.InvestApp.entity.InvestmentProduct;
import com.MiniInvest.InvestApp.repository.InvestmentProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InvestmentProductService {

    private final InvestmentProductRepository productRepo;
    private final GeminiService geminiService;

    @Autowired
    public InvestmentProductService(InvestmentProductRepository productRepo, GeminiService geminiService) {
        this.productRepo = productRepo;
        this.geminiService = geminiService;
    }

    @Transactional
    public InvestmentProduct createProduct(InvestmentProduct product) {
        if (product.getDescription() == null || product.getDescription().isBlank()) {
            String prompt = String.format(
                    "Generate a professional investment product description.\n" +
                            "Name: %s\nType: %s\nTenure: %d months\nAnnual Yield: %.2f%%\nRisk Level: %s",
                    product.getName(),
                    product.getInvestmentType(),
                    product.getTenureMonths(),
                    product.getAnnualYield(),
                    product.getRiskLevel()
            );
            String description = geminiService.generateText(prompt);
            product.setDescription(description);
        }
        return productRepo.save(product);
    }

    public List<InvestmentProduct> getAllProducts() {
        return productRepo.findAll();
    }

    public Optional<InvestmentProduct> getProductById(String id) {
        return productRepo.findById(id);
    }

    public Optional<InvestmentProduct> findById(String id) {
        return productRepo.findById(id);
    }

    public InvestmentProduct updateProduct(String id, InvestmentProduct updatedProduct) {
        return productRepo.findById(id)
                .map(product -> {
                    product.setName(updatedProduct.getName());
                    product.setInvestmentType(updatedProduct.getInvestmentType());
                    product.setTenureMonths(updatedProduct.getTenureMonths());
                    product.setAnnualYield(updatedProduct.getAnnualYield());
                    product.setRiskLevel(updatedProduct.getRiskLevel());
                    product.setMinInvestment(updatedProduct.getMinInvestment());
                    product.setMaxInvestment(updatedProduct.getMaxInvestment());

                    // Regenerate description if missing
                    if (updatedProduct.getDescription() == null || updatedProduct.getDescription().isBlank()) {
                        String prompt = String.format(
                                "Update the investment product description.\n" +
                                        "Name: %s\nType: %s\nTenure: %d months\nAnnual Yield: %.2f%%\nRisk Level: %s",
                                updatedProduct.getName(),
                                updatedProduct.getInvestmentType(),
                                updatedProduct.getTenureMonths(),
                                updatedProduct.getAnnualYield(),
                                updatedProduct.getRiskLevel()
                        );
                        product.setDescription(geminiService.generateText(prompt));
                    } else {
                        product.setDescription(updatedProduct.getDescription());
                    }
                    return productRepo.save(product);
                })
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Transactional
    public void deleteProduct(String id) {
        productRepo.deleteById(id);
    }

    public String recommendProducts(String userRiskAppetite) {
        List<InvestmentProduct> products = productRepo.findAll();
        StringBuilder productList = new StringBuilder();

        for (InvestmentProduct p : products) {
            productList.append(String.format(
                    "Name: %s, Type: %s, Yield: %.2f%%, Risk: %s, Tenure: %d months\n",
                    p.getName(), p.getInvestmentType(),
                    p.getAnnualYield(), p.getRiskLevel(),
                    p.getTenureMonths()
            ));
        }

        String prompt = String.format(
                "Suggest the top 3 investment products for a user with %s risk appetite. " +
                        "Here are the available products:\n%s",
                userRiskAppetite, productList
        );

        return geminiService.generateText(prompt);
    }

    public String getIdByName(String name) {
        Optional<InvestmentProduct> product = productRepo.findByName(name);
        return product.map(InvestmentProduct::getId).orElse("Product not found");
    }
}

