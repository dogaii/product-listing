import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faStar, faStarHalfAlt, faStar as emptyStar } from "@fortawesome/free-solid-svg-icons";
import Slider from "react-slick";
import React, { useState, useEffect } from "react";
import "./App.css";

// Custom Arrow Components
const NextArrow = ({ onClick }) => (
  <div className="slick-arrow slick-next" onClick={onClick}>
    <FontAwesomeIcon icon={faChevronRight} />
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div className="slick-arrow slick-prev" onClick={onClick}>
    <FontAwesomeIcon icon={faChevronLeft} />
  </div>
);

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minPopularity: "",
    maxPopularity: "",
  });
  const [activeColors, setActiveColors] = useState({});

  // Fetch initial products
  useEffect(() => {
    fetch("http://localhost:5001/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);

        const initialColors = {};
        data.forEach((product) => {
          initialColors[product.name] = "yellow";
        });
        setActiveColors(initialColors);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const generateStars = (score) => {
    const maxStars = 5;
    const fullStars = Math.floor(score);
    const halfStar = score % 1 >= 0.5 ? 1 : 0;
    const emptyStars = maxStars - fullStars - halfStar;

    return (
      <>
        {Array(fullStars)
          .fill()
          .map((_, i) => (
            <FontAwesomeIcon key={`full-${i}`} icon={faStar} style={{ color: "#f5c518" }} />
          ))}
        {halfStar ? <FontAwesomeIcon icon={faStarHalfAlt} style={{ color: "#f5c518" }} /> : null}
        {Array(emptyStars)
          .fill()
          .map((_, i) => (
            <FontAwesomeIcon key={`empty-${i}`} icon={emptyStar} style={{ color: "#ccc" }} />
          ))}
        <span> ({score.toFixed(1)}/5)</span>
      </>
    );
  };

  const handleColorChange = (productName, color) => {
    setActiveColors((prev) => ({
      ...prev,
      [productName]: color,
    }));
  };

  const renderColorOptions = (productName, images) => (
    <div className="color-options">
      {Object.keys(images).map((color) => (
        <div
          key={color}
          className={`color-circle ${color} ${
            activeColors[productName] === color ? "active" : ""
          }`}
          onClick={() => handleColorChange(productName, color)}
        ></div>
      ))}
    </div>
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    const query = new URLSearchParams(filters).toString();
    fetch(`http://localhost:5001/products?${query}`)
      .then((response) => response.json())
      .then((data) => {
        // Remove duplicates by 'name'
        const uniqueProducts = data.filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.name === value.name)
        );
        setProducts(uniqueProducts); // Ensure no duplicates
      })
      .catch((error) => console.error("Error applying filters:", error));
  };
  
  

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (loading || !products.length) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="product-list">
      <h1>Product List</h1>

      {/* Filters Section */}
      <div className="filters">
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="minPopularity"
          placeholder="Min Popularity"
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="maxPopularity"
          placeholder="Max Popularity"
          onChange={handleFilterChange}
        />
        <button onClick={applyFilters}>Apply Filters</button>
      </div>

      <Slider {...carouselSettings}>
        {products.map((product) => (
          <div key={product.name} className="product-item">
            <img
              src={product.images[activeColors[product.name]] || product.images.yellow}
              alt={product.name}
              className="product-image"
            />
            <h2>{product.name}</h2>
            <p>         {activeColors[product.name].charAt(0).toUpperCase() + activeColors[product.name].slice(1)} Gold
</p>
            <p>Popularity: {generateStars(product.popularityScoreOutOf5)}</p>
            <p>Price: ${product.price}</p>
            {renderColorOptions(product.name, product.images)}
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default App;
