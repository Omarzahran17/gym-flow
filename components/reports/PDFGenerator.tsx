"use client"

import { useState } from "react"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { format } from "date-fns"

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "1px solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 150,
    fontSize: 10,
  },
  value: {
    flex: 1,
    fontSize: 10,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    fontSize: 9,
    borderBottom: "0.5px solid #ddd",
  },
  tableCell: {
    flex: 1,
  },
  summaryBox: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    marginBottom: 15,
  },
})

interface RevenueReportData {
  period: { start: string; end: string }
  subscriptions: Array<{
    date: string
    memberId: number
    planName: string
    amount: string
    status: string
  }>
  summary: {
    totalRevenue: number
    totalSubscriptions: number
  }
}

function RevenueReportPDF({ data }: { data: RevenueReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Revenue Report</Text>
          <Text style={styles.subtitle}>
            Period: {format(new Date(data.period.start), "MMM d, yyyy")} - {format(new Date(data.period.end), "MMM d, yyyy")}
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Revenue:</Text>
            <Text style={styles.value}>${data.summary.totalRevenue.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Subscriptions:</Text>
            <Text style={styles.value}>{data.summary.totalSubscriptions}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription Details</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Date</Text>
              <Text style={styles.tableCell}>Member</Text>
              <Text style={styles.tableCell}>Plan</Text>
              <Text style={styles.tableCell}>Amount</Text>
              <Text style={styles.tableCell}>Status</Text>
            </View>
            {data.subscriptions.map((sub, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{format(new Date(sub.date), "MMM d, yyyy")}</Text>
                <Text style={styles.tableCell}>Member #{sub.memberId}</Text>
                <Text style={styles.tableCell}>{sub.planName}</Text>
                <Text style={styles.tableCell}>${sub.amount}</Text>
                <Text style={styles.tableCell}>{sub.status}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  )
}

interface AttendanceReportData {
  period: { months: number; start: string; end: string }
  records: Array<{
    date: string
    day: string
    time: string
    memberId: number
    method: string
  }>
  summary: {
    totalCheckIns: number
    uniqueMembers: number
  }
}

function AttendanceReportPDF({ data }: { data: AttendanceReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Attendance Report</Text>
          <Text style={styles.subtitle}>
            Period: Last {data.period.months} Months ({format(new Date(data.period.start), "MMM d, yyyy")} - {format(new Date(data.period.end), "MMM d, yyyy")})
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Check-ins:</Text>
            <Text style={styles.value}>{data.summary.totalCheckIns}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Unique Members:</Text>
            <Text style={styles.value}>{data.summary.uniqueMembers}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance Records</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Date</Text>
              <Text style={styles.tableCell}>Day</Text>
              <Text style={styles.tableCell}>Time</Text>
              <Text style={styles.tableCell}>Member</Text>
              <Text style={styles.tableCell}>Method</Text>
            </View>
            {data.records.slice(0, 50).map((record, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{format(new Date(record.date), "MMM d, yyyy")}</Text>
                <Text style={styles.tableCell}>{record.day}</Text>
                <Text style={styles.tableCell}>{record.time}</Text>
                <Text style={styles.tableCell}>Member #{record.memberId}</Text>
                <Text style={styles.tableCell}>{record.method}</Text>
              </View>
            ))}
          </View>
          {data.records.length > 50 && (
            <Text style={{ fontSize: 10, marginTop: 10, textAlign: "center" }}>
              ... and {data.records.length - 50} more records
            </Text>
          )}
        </View>
      </Page>
    </Document>
  )
}

interface PDFGeneratorProps {
  type: "revenue" | "attendance"
  period: string
  onDataLoaded: (data: any) => void
}

export function PDFDownloadButton({ type, period, onDataLoaded }: PDFGeneratorProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/reports/${type}/export?period=${period}&format=pdf`)
      if (!response.ok) throw new Error("Failed to fetch report data")
      
      const result = await response.json()
      setData(result.data)
      onDataLoaded(result.data)
    } catch (err) {
      console.error("Error fetching report data:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!data) {
    return (
      <Button 
        variant="outline" 
        className="w-full"
        onClick={fetchData}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileText className="h-4 w-4 mr-2" />
        )}
        Load PDF Data
      </Button>
    )
  }

  const PDFComponent = type === "revenue" ? RevenueReportPDF : AttendanceReportPDF
  const filename = `${type}-report-${format(new Date(), "yyyy-MM-dd")}.pdf`

  return (
    <PDFDownloadLink
      document={<PDFComponent data={data} />}
      fileName={filename}
      className="w-full"
    >
      {({ loading: pdfLoading }) => (
        <Button className="w-full" disabled={pdfLoading}>
          {pdfLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          {pdfLoading ? "Generating PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  )
}