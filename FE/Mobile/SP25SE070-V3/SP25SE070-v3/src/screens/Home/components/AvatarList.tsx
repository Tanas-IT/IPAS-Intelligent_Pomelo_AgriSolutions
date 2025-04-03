import TextCustom from "components/TextCustom";
import { Image, StyleSheet, View } from "react-native";

export const AvatarList = ({ avatars }: { avatars: string[] }) => (
  <View style={styles.avatarContainer}>
    {avatars.slice(0, 3).map((avatar, index) => ( // max: 3
      <Image
        key={index}
        source={{ uri: avatar }}
        style={[
          styles.avatar,
          { zIndex: -index }, // override avt
          index > 0 && { marginLeft: -10 },
        ]}
      />
    ))}
    {avatars.length > 3 && (
      <View style={styles.moreAvatar}>
        <TextCustom style={styles.moreText}>+{avatars.length - 3}</TextCustom>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fff',
      },
      moreAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -10,
      },
      moreText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
      },
})