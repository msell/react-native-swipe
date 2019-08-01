import React from "react";
import { View, Animated, PanResponder, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 0.5 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 450;

const Deck = props => {
  const [position, setPosition] = React.useState(new Animated.ValueXY());
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    setPosition(new Animated.ValueXY());
  }, [index]);
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: {
        x: 0,
        y: 0
      }
    }).start();
  };

  const onSwipeComplete = direction => {
    const { onSwipeRight, onSwipeLeft, data } = props;
    const item = data[index];
    direction === "right" ? onSwipeRight(item) : onSwipeLeft(item);
    setIndex(index + 1);
  };

  const forceSwipe = direction => {
    Animated.timing(position, {
      toValue: {
        x: direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH,
        y: 0
      },
      duration: SWIPE_OUT_DURATION
    }).start(() => onSwipeComplete(direction));
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
      // console.log(gesture);
      position.setValue({
        x: gesture.dx,
        y: gesture.dy
      });
    },
    onPanResponderRelease: (event, gesture) => {
      if (gesture.dx >= SWIPE_THRESHOLD) {
        forceSwipe("right");
        return;
      }

      if (gesture.dx <= -SWIPE_THRESHOLD) {
        forceSwipe("left");
        return;
      }
      resetPosition();
    }
  });

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.7, 0, SCREEN_WIDTH * 1.7],
      outputRange: ["-120deg", "0deg", "120deg"]
    });
    return {
      ...position.getLayout(),
      transform: [
        {
          rotate
        }
      ]
    };
  };
  const renderCards = () => {
    console.log("render");
    return props.data.map((item, i) => {
      if (i < index) {
        return null;
      }
      if (i === index) {
        return (
          <Animated.View
            key={item.id}
            style={getCardStyle()}
            {...panResponder.panHandlers}
          >
            {props.renderCard(item)}
          </Animated.View>
        );
      }
      return props.renderCard(item);
    });
  };
  return <View>{renderCards()}</View>;
};

export default Deck;
