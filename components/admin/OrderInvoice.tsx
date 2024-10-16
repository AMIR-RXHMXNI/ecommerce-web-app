import React from 'react'
import { PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
  },
})

const OrderInvoice = ({ order }) => {
  const InvoiceDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Invoice</Text>
          <Text style={styles.subheader}>Order #{order.id}</Text>
          <Text style={styles.text}>Date: {new Date(order.created_at).toLocaleDateString()}</Text>
          <Text style={styles.text}>Customer: {order.user_profiles.full_name}</Text>
          <Text style={styles.text}>Email: {order.user_profiles.email}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.subheader}>Order Items</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Product</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Quantity</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Price</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Subtotal</Text>
              </View>
            </View>
            {order.order_items.map((item) => (
              <View style={styles.tableRow} key={item.id}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.products.name}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.quantity}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>${item.price.toFixed(2)}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>${(item.quantity * item.price).toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.text}>Total Amount: ${order.total_amount.toFixed(2)}</Text>
        </View>
      </Page>
    </Document>
  )

  return (
    <div>
      <PDFViewer width="100%" height={600}>
        <InvoiceDocument />
      </PDFViewer>
    </div>
  )
}

export default OrderInvoice