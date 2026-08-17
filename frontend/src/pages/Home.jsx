import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import ProductCard from '../components/ProductCard.jsx';

const Home=()=>{
    const [products, setProducts] = useState([
        {
            _id: 1,
            name: "Sample Product 1",
            price: 299.99,
            imageUrl: "https://via.placeholder.com/250x250?text=Product+1"
        },
        {
            _id: 2,
            name: "Sample Product 2",
            price: 399.99,
            imageUrl: "https://via.placeholder.com/250x250?text=Product+2"
        },
        {
            _id: 3,
            name: "Sample Product 3",
            price: 499.99,
            imageUrl: "https://via.placeholder.com/250x250?text=Product+3"
        }
    ]);

    return (
        <div className="home">
            <h1>Welcome to ShopNest</h1>
            <p>Your one-stop shop for all your needs. Explore our wide range of products</p>
            <Link to="/shop" className="btn">Start Shopping</Link>
            
            <div className="products-container">
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
}

export default Home;