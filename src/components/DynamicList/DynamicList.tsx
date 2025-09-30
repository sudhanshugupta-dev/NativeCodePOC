// import React, { useEffect, useState } from "react";
// import {
//     ActivityIndicator,
//     Animated,
//     Dimensions,
//     FlatList,
//     ScrollView,
//     StyleSheet,
//     Text,
//     View,
// } from "react-native";
// import UserCard from "../UserCard";

// type User = {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   company: string;
//   type: "admin" | "member" | "guest";
// };

// const { width } = Dimensions.get("window");
// const HORIZONTAL_ITEM_WIDTH = width * 0.7;
// const GRID_ITEM_MARGIN = 6;
// const GRID_NUM_COLUMNS = 2;

// type DynamicListProps = {
//   data: User[];
//   loadMore?: () => Promise<User[]>; // for infinite scroll
// };

// const DynamicList = ({ data, loadMore }: DynamicListProps) => {
//   const [listData, setListData] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);

//   // Animated value for cards
//   const fadeAnim = new Animated.Value(0);

//   useEffect(() => {
//     setListData(data);
//     setLoading(false);
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 500,
//       useNativeDriver: true,
//     }).start();
//   }, [data]);

//   // Separate users by type
//   const admins = listData.filter((u) => u.type === "admin");
//   const members = listData.filter((u) => u.type === "member");
//   const guests = listData.filter((u) => u.type === "guest");

//   // Render section: horizontal admins or vertical/grid members/guests
//   const renderSection = (title: string, items: User[], type: string) => {
//     if (items.length === 0) return null;

//     const isHorizontal = type === "admin" && items.length <= 4;
//     const isGrid = type === "member" && items.length > 3;

//     return (
//       <View style={{ marginVertical: 12  }}>
//         <Text style={styles.sectionHeader}>{title}</Text>

//         {isHorizontal ? (
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             {items.map((item) => (
//               <Animated.View
//                 key={item.id}
//                 style={[
//                   { width: HORIZONTAL_ITEM_WIDTH, marginHorizontal: 8, opacity: fadeAnim },
//                 ]}
//               >
//                 <UserCard user={item} />
//               </Animated.View>
//             ))}
//           </ScrollView>
//         ) : isGrid ? (
//           <FlatList
//             data={items}
//             key={GRID_NUM_COLUMNS} // force re-render if columns change
//             numColumns={GRID_NUM_COLUMNS}
//             columnWrapperStyle={{ justifyContent: "space-between" }}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <Animated.View
//                 style={[
//                   {
//                     flex: 1,
//                     margin: GRID_ITEM_MARGIN,
//                     maxWidth:
//                       (width - GRID_ITEM_MARGIN * (GRID_NUM_COLUMNS * 2)) / GRID_NUM_COLUMNS,
//                     opacity: fadeAnim,
//                   },
//                 ]}
//               >
//                 <UserCard user={item} />
//               </Animated.View>
//             )}
//           />
//         ) : (
//           // Vertical list
//           <FlatList
//             data={items}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <Animated.View style={{ marginVertical: 6, opacity: fadeAnim }}>
//                 <UserCard user={item} />
//               </Animated.View>
//             )}
//           />
//         )}
//       </View>
//     );
//   };

//   const handleLoadMore = async () => {
//     if (!loadMore || loadingMore) return;
//     setLoadingMore(true);
//     const moreData = await loadMore();
//     setListData((prev) => [...prev, ...moreData]);
//     setLoadingMore(false);
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <FlatList
//       data={[0]} // dummy data for outer FlatList to hold all sections
//       renderItem={() => (
//         <View>
//           {renderSection("Admins", admins, "admin")}
//           {renderSection("Members", members, "member")}
//           {renderSection("Guests", guests, "guest")}
//         </View>
//       )}
//       keyExtractor={(item, index) => String(index)}
//       onEndReached={handleLoadMore}
//       onEndReachedThreshold={0.5}
//       ListFooterComponent={loadingMore ? <ActivityIndicator /> : null}
//       contentContainerStyle={{ paddingHorizontal: 6, paddingBottom: 20 }}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 8,
//     marginLeft: 4,
//   },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
// });

// export default DynamicList;



import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    View
} from "react-native";
import UserCard from "../UserCard";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: "admin" | "member" | "guest";
  avatar?: string;
};

const { width } = Dimensions.get("window");
const HORIZONTAL_ITEM_WIDTH = width * 0.7;
const GRID_ITEM_MARGIN = 6;
const GRID_NUM_COLUMNS = 2;

type DynamicListProps = {
  data: User[];
  loadMore?: () => Promise<User[]>;
};

const DynamicList = ({ data, loadMore }: DynamicListProps) => {
  const [listData, setListData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setListData(data);
    setLoading(false);
  }, [data]);

  // Separate by type
  const admins = listData.filter((u) => u.type === "admin");
  const members = listData.filter((u) => u.type === "member");
  const guests = listData.filter((u) => u.type === "guest");

  // Horizontal carousel for admins
  const renderAdminCarousel = () => {
    if (admins.length === 0) return null;

    return (
      <Animated.FlatList
        data={admins}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={HORIZONTAL_ITEM_WIDTH + 16} // marginHorizontal = 8
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 8 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (HORIZONTAL_ITEM_WIDTH + 16),
            index * (HORIZONTAL_ITEM_WIDTH + 16),
            (index + 1) * (HORIZONTAL_ITEM_WIDTH + 16),
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              style={{
                width: HORIZONTAL_ITEM_WIDTH,
                marginHorizontal: 8,
                transform: [{ scale }],
              }}
            >
              <UserCard user={item} />
            </Animated.View>
          );
        }}
      />
    );
  };

  // Grid for members
  const renderMemberGrid = () => {
    if (members.length === 0) return null;
    return (
      <FlatList
        data={members}
        key={GRID_NUM_COLUMNS} // force re-render if columns change
        numColumns={GRID_NUM_COLUMNS}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              flex: 1,
              margin: GRID_ITEM_MARGIN,
              maxWidth: (width - GRID_ITEM_MARGIN * (GRID_NUM_COLUMNS * 2)) / GRID_NUM_COLUMNS,
            }}
          >
            <UserCard user={item} />
          </View>
        )}
      />
    );
  };

  // Vertical list for guests
  const renderGuestList = () => {
    if (guests.length === 0) return null;
    return (
      <FlatList
        data={guests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 6 }}>
            <UserCard user={item} />
          </View>
        )}
      />
    );
  };

  const handleLoadMore = async () => {
    if (!loadMore || loadingMore) return;
    setLoadingMore(true);
    const moreData = await loadMore();
    setListData((prev) => [...prev, ...moreData]);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={[0]} // dummy for rendering all sections
      renderItem={() => (
        <View>
          {renderAdminCarousel()}
          {renderMemberGrid()}
          {renderGuestList()}
        </View>
      )}
      keyExtractor={(item, index) => String(index)}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loadingMore ? <ActivityIndicator /> : null}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};

export default DynamicList;
