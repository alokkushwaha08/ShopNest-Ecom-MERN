import React, {useContext} from "react";
import {Link} from "react-router-dom";
import {AuthContext} from "../context/AuthContext";
import "../styles/navbar.css";


const Navbar=()=>{
    const {user, logout} = useContext(AuthContext);
    const cardItems=useSelector((state) => state.cart.cartItems);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        Navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <img src="/logo.png" alt="ShopNest Logo" className="navbar-logo" />
                </Link>
            </div>
            <ul className="navbar-links">
                <li><Link to="/shop">Shop</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                {user ? (
                    <>
                        <li><Link to="/profile">Hi, {user.name}</Link></li>
                        {user.role === "admin" && <li><Link to="/admin">Admin</Link></li>}
                        <li><button onClick={handleLogout} className="btn-logout">Logout</button></li>
                    </>
                ) : (
                    <li><Link to="/login">Login</Link></li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;