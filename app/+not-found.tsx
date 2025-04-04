import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Chrome as Home } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Text style={styles.title}>404</Text>
            <View style={styles.line} />
            <Text style={styles.subtitle}>Page Not Found</Text>
          </View>
          
          <Text style={styles.description}>
            Oops! We couldn't find the page you're looking for.
          </Text>
          
          <Link href="/images" asChild>
            <TouchableOpacity style={styles.button} activeOpacity={0.8}>
              <Home size={20} color="#ffffff" />
              <Text style={styles.buttonText}>Return Home</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 120,
    fontWeight: '700',
    color: '#0891b2',
    letterSpacing: -4,
  },
  line: {
    width: 60,
    height: 4,
    backgroundColor: '#0891b2',
    marginVertical: 24,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 300,
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0891b2',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#0891b2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});