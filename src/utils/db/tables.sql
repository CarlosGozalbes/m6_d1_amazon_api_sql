CREATE TABLE IF NOT EXISTS 
    products(
        product_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name_ VARCHAR(100) NOT NULL,
        description_ VARCHAR(100) NOT NULL,
        image_url VARCHAR(255) DEFAULT 'https://i.pravatar.cc/300',
        price INT NOT NULL,
        category VARCHAR(100) NOT NULL
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    

CREATE TABLE IF NOT EXISTS
    reviews(
        review_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        comment TEXT NOT NULL,
        rate INT NOT NULL CHECK(rate BETWEEN 0 AND 5)
        product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );


    
-- how to update table ? 

-- https://www.postgresqltutorial.com/postgresql-alter-table/