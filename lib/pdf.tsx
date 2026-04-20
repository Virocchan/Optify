import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D9E75',
  },
  subtitle: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1A1A1A',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 120,
    fontSize: 9,
    color: '#6B7280',
  },
  value: {
    fontSize: 9,
    color: '#1A1A1A',
    fontWeight: 'medium',
  },
  diagnosisBox: {
    padding: 15,
    borderRadius: 6,
    marginBottom: 15,
  },
  diagnosisBoxNormal: {
    backgroundColor: '#E8F5F0',
    borderLeftWidth: 4,
    borderLeftColor: '#1D9E75',
  },
  diagnosisBoxGlaucoma: {
    backgroundColor: '#FCEAEA',
    borderLeftWidth: 4,
    borderLeftColor: '#E24B4A',
  },
  diagnosisLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  diagnosisConfidence: {
    fontSize: 9,
    color: '#6B7280',
  },
  imageRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
  },
  image: {
    maxWidth: 250,
    maxHeight: 250,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imageCaption: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F3',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F3',
  },
  tableCell: {
    fontSize: 9,
  },
  explanationBox: {
    padding: 12,
    backgroundColor: '#F5F5F3',
    borderRadius: 4,
    marginBottom: 20,
  },
  explanationText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#1A1A1A',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 4,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 8,
    color: '#92400E',
    fontWeight: 'medium',
  },
})

interface ReportPDFProps {
  diagnosis: {
    prediction: 'glaucoma' | 'normal'
    confidence: number
    cdr: number
  }
  patient: {
    age?: number
    eye_side?: string
    iop?: number
    md?: number
    visual_field_pattern?: string
  }
  gradcamImage: string
  geminiExplanation: string
  featureImportance: Record<string, number>
}

export function DiagnosisReport({ diagnosis, patient, gradcamImage, geminiExplanation, featureImportance }: ReportPDFProps) {
  const isGlaucoma = diagnosis.prediction === 'glaucoma'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Optify Diagnostic Report</Text>
            <Text style={styles.subtitle}>AI-assisted glaucoma screening</Text>
          </View>
          <Text style={{ fontSize: 9, color: '#6B7280' }}>
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Patient Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Age</Text>
            <Text style={styles.value}>{patient.age || 'Not specified'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Eye</Text>
            <Text style={styles.value}>{patient.eye_side || 'Not specified'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>IOP (mmHg)</Text>
            <Text style={styles.value}>{patient.iop || 'Not specified'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mean Deviation (dB)</Text>
            <Text style={styles.value}>{patient.md || 'Not specified'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Visual Field Pattern</Text>
            <Text style={styles.value}>{patient.visual_field_pattern || 'Not specified'}</Text>
          </View>
        </View>

        {/* Diagnosis Result */}
        <View style={[styles.diagnosisBox, isGlaucoma ? styles.diagnosisBoxGlaucoma : styles.diagnosisBoxNormal]}>
          <Text style={[styles.diagnosisLabel, { color: isGlaucoma ? '#E24B4A' : '#1D9E75' }]}>
            {isGlaucoma ? 'Glaucoma Detected' : 'No Glaucoma Detected'}
          </Text>
          <Text style={styles.diagnosisConfidence}>
            Confidence: {diagnosis.confidence.toFixed(1)}% | CDR: {diagnosis.cdr.toFixed(3)}
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            AI-assisted screening only. This report must be reviewed by a licensed ophthalmologist before clinical use.
          </Text>
        </View>

        {/* Images */}
        <View style={styles.imageRow}>
          <View style={styles.imageContainer}>
            {gradcamImage && (
              <>
                <Image src={gradcamImage} style={styles.image} />
                <Text style={styles.imageCaption}>Fundus Image with Grad-CAM Overlay</Text>
              </>
            )}
          </View>
        </View>

        {/* Feature Importance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feature Importance</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Feature</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Contribution</Text>
            </View>
            {Object.entries(featureImportance)
              .sort((a, b) => b[1] - a[1])
              .map(([feature, value]) => (
                <View key={feature} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{value.toFixed(1)}%</Text>
                </View>
              ))}
          </View>
        </View>

        {/* AI Explanation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Explanation</Text>
          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>{geminiExplanation}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This report is AI-assisted and must be reviewed by a licensed ophthalmologist before clinical use.
          </Text>
        </View>
      </Page>
    </Document>
  )
}