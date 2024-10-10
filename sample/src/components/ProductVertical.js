import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { blackColor, grayColor, redColor, whiteColor, lightGreenColor, lightGrayColor, lightGrayOpacityColor } from '../constants/Color'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { ADD_TO_CART, INSTOCK, OUT_OF_STOCK } from '../constants/Constants';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import QuickViewModal from './Modal/QuickViewModal'
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../redux/actions/wishListActions';
import { logEvent } from '@amplitude/analytics-react-native';
import { addProductToCart, removeProductFromCart } from '../redux/actions/cartActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import { ADD_TO_CART_IMG } from '../assests/images';
const { alignItemsCenter, resizeModeCover, flexDirectionRow, alignJustifyCenter, borderWidth1, textAlign, resizeModeContain, positionAbsolute } = BaseStyle;

const ProductVertical = ({ product, onAddToCart, saveIconTop, inventoryQuantity, loading, onPress, option, ids, width, height, spaceTop }) => {
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const imageSource = product?.images?.edges ? product?.images?.edges[0]?.node?.url : product?.images?.nodes[0]?.url;
  const price = product?.variants?.edges ? product?.variants?.edges[0]?.node?.price : product?.variants?.nodes[0];
  const priceAmount = price?.price ? price?.price : price?.amount;
  const currencyCode = price ? price?.currencyCode : null;
  const [quantity, setQuantity] = useState(1);
  const outOfStock = inventoryQuantity && inventoryQuantity[0] === 0;
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();
  const wishList = useSelector(state => state.wishlist.wishlist);
  const isSelected = wishList.some(item => item.id === product.id);
  const cart = useSelector(state => state.cart.cartItems);
  const isInCart = cart.some(item => item.id === product.id);
  const [showQuantity, setShowQuantity] = useState(false);
  const [shopCurrency, setShopCurrency] = useState('');

  useEffect(() => {
    if (!isInCart) {
      setShowQuantity(false);
    }
  }, [cart, isInCart]);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const shopCurrency = await AsyncStorage.getItem('shopCurrency');
        if (shopCurrency) {
          setShopCurrency(shopCurrency);
        }
      } catch (error) {
        console.error('Error fetching shop currency:', error);
      }
    };
    fetchCurrency();
  }, []);

  const handlePress = () => {
    const productWithInventory = {
      ...product,
      inventoryQuantity: inventoryQuantity
    };
    if (!isSelected) {
      dispatch(addToWishlist(product));
      logEvent(`Product Add to wishlish ProductId: ${product.id}`);
    } else {
      dispatch(removeFromWishlist(product));
      logEvent(`Product remove from wishlist ProductId: ${product.id}`);
    }
  };

  const incrementQuantity = () => {
    logEvent('Increase Product Quantity');
    setQuantity(quantity + 1);
    onAddToCart(product?.variants?.edges ? product?.variants?.edges[0]?.node?.id : product?.variants?.nodes[0]?.id, 1);
  };

  const decrementQuantity = () => {
    logEvent('Decrease Product Quantity');
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const showQuickViewModal = () => {
    setModalVisible(true)
    logEvent(`Quick view modal open for  ${product.id}`)
  }
  const handleAddToCart = () => {
    logEvent('Add to Cart');
    onAddToCart(product?.variants?.edges ? product?.variants?.edges[0]?.node?.id : product?.variants?.nodes[0]?.id, quantity);
    setShowQuantity(true);
  };

  const trimcateText = (text) => {
    const words = text.split(' ');
    if (words.length > 2) {
      return words.slice(0, 2).join(' ') + '...';
    }
    return text;
  };

  return (
    <Pressable style={[styles.productContainer, {
      width: width ? width : wp(45), height: height ? height : wp(55), backgroundColor: isDarkMode ? grayColor : whiteColor,
      marginVertical: isDarkMode ? spacings.xxsmall : spaceTop, marginHorizontal: spaceTop ? 0 : 0, borderRadius: 5
    }]} onPress={onPress}>
      <View style={{ width: "100%", marginBottom: spacings.small, borderRadius: 10 }}>
        {/* <TouchableOpacity style={[positionAbsolute, alignJustifyCenter, styles.eyeButton]} onPress={showQuickViewModal}>
          <Ionicons
            name="eye-outline"
            size={18}
            color={blackColor}
          />
        </TouchableOpacity> */}
        <Image
          source={{ uri: imageSource }}
          style={[styles.productImage, { resizeMode: "contain" }]}
        />
      </View>
      <View style={[styles.contentBox]}>
        <View style={[{ width: "94%", height: hp(8), alignSelf: "center" }]}>
          <Text style={[styles.productName, { color: colors.blackColor }]}>{trimcateText(product?.title)}</Text>
          <TouchableOpacity style={[positionAbsolute, alignJustifyCenter, styles.favButton, { bottom: saveIconTop ? 150 : 35, right: spaceTop ? -5 : -8 }]} onPress={handlePress}>
            <AntDesign
              name={isSelected ? "heart" : "hearto"}
              size={18}
              color={isSelected ? redColor : "#868889"}
            />
          </TouchableOpacity>
          <Text style={{ fontSize: 14 }}>
            1 Packet
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View >

              {priceAmount && (
                <Text style={[styles.productPrice, { color: colors.blackColor, marginTop: 10, }]}>
                  {priceAmount} {currencyCode ? currencyCode : shopCurrency}
                </Text>)}
            </View>
            <View style={[{}, alignItemsCenter]}>
              {loading ? (
                <View style={styles.addToCartButton}>
                  <ActivityIndicator size="small" color={redColor} />
                </View>
              ) : (showQuantity && !outOfStock ? (
                <View style={[styles.quantityContainer]}>
                  <TouchableOpacity onPress={decrementQuantity}>
                    <AntDesign
                      name={"minuscircle"}
                      size={25}
                      color={"#eb4335"}
                    />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{quantity}</Text>
                  <TouchableOpacity onPress={incrementQuantity}  >
                    <AntDesign
                      name={"pluscircle"}
                      size={25}
                      color={"#eb4335"}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                !outOfStock && (
                  <Pressable
                    style={styles.addToCartButton}
                    onPress={handleAddToCart}>
                    <Image
                      source={ADD_TO_CART_IMG}
                      style={{ height: 35, width: 35, resizeMode: "contain" }}
                    />
                    {/* <Text style={styles.addToCartButtonText}>{ADD_TO_CART}</Text> */}
                  </Pressable>
                )
              ))}
              {outOfStock && (
                <View style={[styles.addToCartButton, { width: isDarkMode ? wp(21) : wp(22), bottom:-4 }]}>
                  <Text style={styles.addToCartButtonText}>{OUT_OF_STOCK}</Text>
                </View>
              )}

            </View>
          </View>

        </View>
        <QuickViewModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          product={product}
          options={option}
          ids={ids}
          shopCurrency={shopCurrency}
        />
      </View>

    </Pressable>
  );
};

const styles = StyleSheet.create({
  productContainer: {
    paddingBottom: spacings.large,
    marginRight: 10,
    borderWidth: .5,
    borderColor: "#d9d9d9"
  },
  productImage: {
    width: "100%",
    height: hp(13.5),
    borderRadius: 10,
    // alignSelf: "center",
    marginVertical: spacings.large
  },
  productName: {

    fontSize: style.fontSizeNormal1x.fontSize, fontWeight: style.fontWeightThin1x.fontWeight,
  },
  text: {
    color: "#006400",
    fontSize: style.fontSizeNormal.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
  },
  productPrice: {
    fontSize: style.fontSizeNormal.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    fontFamily: 'GeneralSans-Variable'
  },
  contentBox: {
    width: "100%",
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(20),
    // backgroundColor: whiteColor,
    // paddingHorizontal: 9,
    paddingVertical: 2,
    justifyContent: "center",
  },
  quantityButton: {
    paddingHorizontal: 8,
    paddingTop: 1,
    borderRadius: 5,
    color: whiteColor,
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: 16,
    fontWeight: 'bold',
    color: blackColor,
  },
  addToCartButton: {
    // width: wp(20),
    borderRadius: 10,
    fontSize: 8,
    position:"absolute",
    right:-5,
    bottom:-20,
    // backgroundColor: whiteColor,
    paddingVertical: 5,
  },
  addToCartButtonText: {
    fontSize: 11,
    lineHeight: 18,
    color: redColor,
    fontWeight: '700',
    textAlign: 'center',
  },
  favButton: {
    width: wp(10),
    paddingVertical: 4,
    right: 0,
    zIndex: 10,
  },
  eyeButton: {
    width: wp(8),
    height: wp(8),
    right: 3,
    top: 6,
    zIndex: 10,
    borderRadius: 10,
  },
});

export default ProductVertical;
