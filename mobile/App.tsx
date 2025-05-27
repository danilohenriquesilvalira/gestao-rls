import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>🏭 RLS Automação</Text>
      <Text style={styles.subtitle}>Sistema funcionando!</Text>
      <View style={styles.statusContainer}>
        <View style={[styles.statusCard, styles.successCard]}>
          <Text style={styles.statusTitle}>✅ Mobile App</Text>
          <Text style={styles.statusText}>Estrutura funcionando</Text>
        </View>
        <View style={[styles.statusCard, styles.infoCard]}>
          <Text style={styles.statusTitle}>🚀 Fase 4</Text>
          <Text style={styles.statusText}>Configurações Avançadas</Text>
        </View>
        <View style={[styles.statusCard, styles.warningCard]}>
          <Text style={styles.statusTitle}>📱 Próximo</Text>
          <Text style={styles.statusText}>Navegação React Navigation</Text>
        </View>
      </View>
      <Text style={styles.footer}>Portugal 🇵🇹 • Versão 1.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
    textAlign: 'center',
  },
  statusContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  successCard: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  infoCard: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#d97706',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    marginTop: 32,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});