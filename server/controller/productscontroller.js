import Products from '../model/productsmodel.js'; // Ensure you have the correct file extension

// Create product
export const createProduct = async (request, response) => {
    try {
        const { name, description, category, price, images } = request.body;
        
        if (!name || !description || !category || !price || !images) {
            return response.status(400).send({ message: 'Send all required fields: name, description, category, price, images' });
        }

        const newProduct = {
            name,
            description,
            category,
            price,
            images,
        };

        const product = await Products.create(newProduct);
        return response.status(201).send(product);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
};

// Get all products
export const getProducts = async (request, response) => {
    try {
        const products = await Products.find({});
        return response.status(200).json({
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
};

// Get product by ID
export const getProductById = async (request, response) => {
    try {
        const { id } = request.params;
        const product = await Products.findById(id);
        if (!product) {
            return response.status(404).json({ message: 'Product not found' });
        }
        return response.status(200).json({ product });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
};

// Update product
export const updateProduct = async (request, response) => {
    try {
        const { name, description, category, price, images } = request.body;

        if (!name || !description || !category || !price || !images) {
            return response.status(400).send({ message: 'Send all required fields: name, description, category, price, images' });
        }

        const { id } = request.params;
        const result = await Products.findByIdAndUpdate(id, request.body, { new: true });
        if (!result) {
            return response.status(404).json({ message: 'Product not found' });
        }
        return response.status(200).send({ message: 'Product updated successfully', product: result });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
};

// Delete product
export const deleteProduct = async (request, response) => {
    try {
        const { id } = request.params;
        const result = await Products.findByIdAndDelete(id);
        if (!result) {
            return response.status(404).json({ message: 'Product not found' });
        }
        return response.status(200).send({ message: 'Product deleted successfully' });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
};
