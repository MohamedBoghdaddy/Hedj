import React from "react";
import Slider from "react-slick";
import "../../Styles/kitchen.css";
import Rating from "@mui/material/Rating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import "../../Styles/Products.css"; // Import the CSS
import { Button } from "react-bootstrap";
import "../../Styles/kitchen.css";
const Kitchen = () => {
  var productSliderOptions = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ], // <-- Make sure there's a comma here if there are more properties after
  }; // <-- Make sure this closing curly brace is correct

  return (
    <div className="kitchenproduct">
      <h1>Kitchens</h1>
      <div className="slider1">

        <Slider {...productSliderOptions} >
          <div className="item productItem">
            <div className="imgWrapper">
              <img src="https://i.pinimg.com/736x/c7/26/55/c726555b47cf7fae4bd96e7e1cdcee66.jpg" className="resizeImg" />
            </div>
            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Woody Kitchen</h5>
              <div>This kitchen has a white color scheme that is able to make the kitchen look bright and clean. </div>
              <div style={{ fontWeight: "bolder" }}>Category: Kitchens</div>
              <span className="price">$18000</span>
              <div className="actionsandrating">
                <Rating name="read-only" value={5} readOnly size="small" precision={0.5} />
                <div className="actions">
                  <Button><FaRegHeart /></Button>
                </div>
                <Button> Add to cart </Button>

        <Slider {...productSliderOptions}>
          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://i.pinimg.com/736x/c7/26/55/c726555b47cf7fae4bd96e7e1cdcee66.jpg"
                className="resizeImg"
              />
            </div>{" "}
            <Button className="fav">
              <FontAwesomeIcon icon={faHeart} />
            </Button>
            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Woody Kitchen</h5>
              <div>
                This kitchen has a white color scheme that is able to make the
                kitchen look bright and clean.{" "}
              </div>
              <div style={{ fontWeight: "bolder" }}>Category: Kitchens</div>
              <span className="price">$18000</span>
              <div className="actionsandrating">
                <Rating
                  name="read-only"
                  value={5}
                  readOnly
                  size="small"
                  precision={0.5}
                />
                <div className="actions"></div>
                <Button variant="dark" className="cart-button">
                  add to cart
                </Button>{" "}

              </div>
            </div>
          </div>

          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://i.pinimg.com/564x/a9/f9/93/a9f993e2c49fdea25a82cd04f783d072.jpg"
                className="resizeImg"
              />
            </div>{" "}
            <Button className="fav">
              <FontAwesomeIcon icon={faHeart} />
            </Button>
            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Woody Kitchen</h5>
              <div>
                This kitchen has a white color scheme that is able to make the
                kitchen look bright and clean.{" "}
              </div>
              <div style={{ fontWeight: "bolder" }}>Category: Kitchens</div>
              <span className="price">$18000</span>
              <div className="actionsandrating">
                <Rating
                  name="read-only"
                  value={5}
                  readOnly
                  size="small"
                  precision={0.5}
                />
                <div className="actions"></div>
                <Button variant="dark" className="cart-button">
                  add to cart
                </Button>{" "}
              </div>
            </div>

            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Woody Kitchen</h5>
              <div>This kitchen has a white color scheme that is able to make the kitchen look bright and clean. </div>
              <div style={{ fontWeight: "bolder" }}>Category: Kitchens</div>
              <span className="price">$18000</span>
              <div className="actionsandrating">
                <Rating name="read-only" value={5} readOnly size="small" precision={0.5} />
                <div className="actions">
                  <Button><FaRegHeart /></Button>
                </div>
                <Button> Add to cart </Button>
              </div>
            </div>


          </div>


          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://i.pinimg.com/564x/be/bc/33/bebc33ee1bf891e8c3da7f31eab114b8.jpg"
                className="resizeImg"
              />
            </div>{" "}
            <Button className="fav">
              <FontAwesomeIcon icon={faHeart} />
            </Button>
            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Woody Kitchen</h5>
              <div>
                This kitchen has a white color scheme that is able to make the
                kitchen look bright and clean.{" "}
              </div>
              <div style={{ fontWeight: "bolder" }}>Category: Kitchens</div>
              <span className="price">$18000</span>
              <div className="actionsandrating">
                <Rating
                  name="read-only"
                  value={5}
                  readOnly
                  size="small"
                  precision={0.5}
                />
                <div className="actions"></div>
                <Button variant="dark" className="cart-button">
                  add to cart
                </Button>{" "}
              </div>
            </div>
            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Woody Kitchen</h5>
              <div>This kitchen has a white color scheme that is able to make the kitchen look bright and clean. </div>
              <div style={{ fontWeight: "bolder" }}>Category: Kitchens</div>
              <span className="price">$18000</span>
              <div className="actionsandrating">
                <Rating name="read-only" value={5} readOnly size="small" precision={0.5} />
                <div className="actions">
                  <Button><FaRegHeart /></Button>
                </div>
                <Button> Add to cart </Button>
              </div>
            </div>


          </div>


          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://i.pinimg.com/564x/87/08/a7/8708a71401f1dd16393d54c106657645.jpg"
                className="resizeImg"
              />
            </div>{" "}
            <Button className="fav">
              <FontAwesomeIcon icon={faHeart} />
            </Button>
            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Woody Kitchen</h5>
              <div>
                This kitchen has a white color scheme that is able to make the
                kitchen look bright and clean.{" "}
              </div>
              <div style={{ fontWeight: "bolder" }}>Category: Kitchens</div>
              <span className="price">$18000</span>
              <div className="actionsandrating">
                <Rating
                  name="read-only"
                  value={5}
                  readOnly
                  size="small"
                  precision={0.5}
                />
                <div className="actions"></div>
                <Button variant="dark" className="cart-button">
                  add to cart
                </Button>{" "}
              </div>
            </div>

            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Woody Kitchen</h5>
              <div>This kitchen has a white color scheme that is able to make the kitchen look bright and clean. </div>
              <div style={{ fontWeight: "bolder" }}>Category: Kitchens</div>
              <span className="price">$18000</span>
              <div className="actionsandrating">
                <Rating name="read-only" value={5} readOnly size="small" precision={0.5} />
                <div className="actions">
                  <Button><FaRegHeart /></Button>
                </div>
                <Button> Add to cart </Button>
              </div>
            </div>


          </div>


          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://i.pinimg.com/564x/01/4b/03/014b032e788312ce4231cd61dc5f5f97.jpg"
                className="resizeImg"
              />
            </div>{" "}
            <Button className="fav">
              <FontAwesomeIcon icon={faHeart} />
            </Button>
            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Woody Kitchen</h5>
              <div>
                This kitchen has a white color scheme that is able to make the
                kitchen look bright and clean.{" "}
              </div>
              <div style={{ fontWeight: "bolder" }}>Category: Kitchens</div>
              <span className="price">$18000</span>
              <div className="actionsandrating">
                <Rating
                  name="read-only"
                  value={5}
                  readOnly
                  size="small"
                  precision={0.5}
                />
                <div className="actions"></div>
                <Button variant="dark" className="cart-button">
                  add to cart
                </Button>{" "}
              </div>
            </div>

            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Woody Kitchen</h5>
              <div>This kitchen has a white color scheme that is able to make the kitchen look bright and clean. </div>
              <div style={{ fontWeight: "bolder" }}>Category: Kitchens</div>
              <span className="price">$18000</span>
              <div className="actionsandrating">
                <Rating name="read-only" value={5} readOnly size="small" precision={0.5} />
                <div className="actions">
                  <Button><FaRegHeart /></Button>
                </div>
                <Button> Add to cart </Button>
              </div>
            </div>
          </div>


          <div className="item productItem">
            <div className="imgWrapper">
              <img src="https://i.pinimg.com/564x/39/34/11/393411a46bb801d10eeab69214596516.jpg" className="resizeImg" />
            </div>
            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Woody Kitchen</h5>
              <div>This kitchen has a white color scheme that is able to make the kitchen look bright and clean. </div>
              <div style={{ fontWeight: "bolder" }}>Category: Kitchens</div>
              <span className="price">$18000</span>
              <div className="actionsandrating">
                <Rating name="read-only" value={5} readOnly size="small" precision={0.5} />
                <div className="actions">
                  <Button><FaRegHeart /></Button>
                </div>
                <Button> Add to cart </Button>
              </div>
            </div>
          </div>

        </Slider >
      </div>
    </div >
 

          </div>

          <div className="item productItem">
            <div className="imgWrapper">
              <img
                src="https://i.pinimg.com/564x/39/34/11/393411a46bb801d10eeab69214596516.jpg"
                className="resizeImg"
              />
            </div>
            <Button className="fav">
              <FontAwesomeIcon icon={faHeart} />
            </Button>
            <div className="infoWrapper">
              <h5 style={{ fontWeight: "bolder" }}>Woody Kitchen</h5>
              <div>
                This kitchen has a white color scheme that is able to make the
                kitchen look bright and clean.{" "}
              </div>
              <div style={{ fontWeight: "bolder" }}>Category: Kitchens</div>
              <span className="price">$18000</span>
              <div className="actionsandrating">
                <Rating
                  name="read-only"
                  value={5}
                  readOnly
                  size="small"
                  precision={0.5}
                />
                <div className="actions"></div>
                <Button variant="dark" className="cart-button">
                  add to cart
                </Button>{" "}
              </div>
            </div>
          </div>
        </Slider>
      </div>
    </div>
  );
};


export default Kitchen;
