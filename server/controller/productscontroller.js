import { request, response } from 'express';
import Product from '../model/productsmodel';
import { name } from 'ejs';

app.post('/products',async(request,response) =>{
    try {
       if( !request.body.name ||
        !request.body.description  ||
        !request.body.category  ||
        !request.body.price 
       /* !request.body.images*/) {
            return response.status(400).send({message:'Send all required fields :name,description,category,price,images'});
        }
        const newProduct={
            name: request.body.name,
            description: request.body.description,
            category: request.body.category,
            price: request.body.price,
          //  images: request.body.images,
        };
        const product = await Product.create(newProduct);
        return response.status(201).send(book);
        
    } catch (error) {
        console.log(error.message);
        response.status(500).send({message: error.message});
    }
}

);