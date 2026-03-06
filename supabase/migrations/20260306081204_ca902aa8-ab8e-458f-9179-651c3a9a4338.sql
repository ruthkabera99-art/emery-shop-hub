
-- Update badges for Men's products
UPDATE products SET badge = 'Bestseller' WHERE name IN ('Jordan 1 Retro High OG', 'Nike Dunk Low Latte', 'Nike Air Force 1 ''07 White', 'New Balance 550 White Green', 'Nike SB Dunk Low Pro', 'Jordan 1 Mid Banned');
UPDATE products SET badge = 'Limited' WHERE name IN ('Jordan 1 Low Travis Scott', 'Nike Air Presto Off-White');
UPDATE products SET badge = 'New' WHERE name IN ('Nike Blazer Mid ''77', 'Adidas Forum Low White', 'Puma RS-X Reinvention', 'Adidas Gazelle Bold', 'New Balance 2002R Protection Pack');

-- Update badges for Women's products
UPDATE products SET badge = 'New' WHERE name IN ('Nike Air Force 1 Low Blush', 'Jordan 1 Mid SE Rose', 'Nike Cortez Vintage', 'Puma Cali Dream Pastel', 'Puma Mayze Stack White', 'Nike Dunk Low Lilac', 'Puma Speedcat OG Sparco');
UPDATE products SET badge = 'Bestseller' WHERE name IN ('Nike Dunk Low Cacao Wow', 'Adidas Samba OG Cream', 'Adidas Gazelle Indoor Pink', 'Jordan 1 Low Coconut Milk');
UPDATE products SET badge = 'Limited' WHERE name IN ('Jordan 4 Shimmer');

-- Update badges for Kids products
UPDATE products SET badge = 'New' WHERE name IN ('Jordan 1 Mid Kids Bred', 'Nike AF1 Kids Triple White', 'Puma Future Rider Kids', 'Jordan 1 Mid Kids Lakers', 'Jordan Flare Kids Red');
UPDATE products SET badge = 'Bestseller' WHERE name IN ('Nike Star Runner 3 Kids', 'Nike Air Max 270 Kids React', 'Nike Court Borough Kids');

-- Update badges for Sports products
UPDATE products SET badge = 'New' WHERE name IN ('Nike Air Max Volt Runner', 'Nike Invincible 3', 'Nike Jordan Luka 2', 'Puma MB.03 Toxic', 'Nike LeBron 21', 'Jordan Tatum 2 Vortex');
UPDATE products SET badge = 'Pro' WHERE name IN ('Nike ZoomX Vaporfly', 'Nike Air Zoom Tempo NEXT%', 'Adidas Adizero Adios Pro 3', 'Puma Deviate Nitro Elite', 'New Balance FuelCell SC Elite');
UPDATE products SET badge = 'Bestseller' WHERE name IN ('Nike Pegasus 41 Electric', 'Adidas Ultraboost Light', 'New Balance Fresh Foam X');

-- Update badges for Sale products
UPDATE products SET badge = 'Sale' WHERE category = 'sale';
