import { Stack } from 'expo-router';

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Word of the Day' }} />
      <Stack.Screen name="history" options={{ title: 'History' }} />
    </Stack>
  );
};

export default Layout;
