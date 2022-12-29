const postgres = require('postgres')
const { Client } = require('pg')
const express = require('express');
const app = express();
app.use(express.json()) 
const port = 3000;

const client = new Client('postgres://products_bme6_user:0NT8MGF8HGyjGt8FnlojtJgSxHxuLM7a@dpg-ce6q7002i3mk2v530djg-a.singapore-postgres.render.com/products_bme6?ssl=true', {
  host                 : 'singapore-postgres.render.com',            // Postgres ip address[s] or domain name[s]
  port                 : 5432,          // Postgres server port[s]
  database             : 'products_bme6',            // Name of database to connect to
  username             : 'u',            // Username of database user
  password             : 'p',            // Password of database user
  
})
client.connect((err) => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected')
    }
  })
 
  
    function runQuery (query, values){
      
    try{


      
    if(values){
      return client.query(query, values)
    }
    else{
      
    return  client.query({
        text: query,
    
      })
    }

    }
    catch(err){
        console.log("error message" + err)
    }
  }


 app.get('/productSearch', async (req, res) => {

    const channelid = await runQuery('select channel_id from public."CHANNEL"');
    const products = await runQuery(` SELECT product_reference_id, public."PRODUCT2".sku, title, quantity, mrp, brand, material, image_url1, image_url2, image_url3, image_url4, image_url5 from public."PRODUCT2" inner join public."STOCK" on public."PRODUCT2".sku=public."STOCK".sku `);

    products.rows.map(product=>{
        product['channel_id']=channelid.rows[0].channel_id
        
    })
    
    res.json(products.rows)
});

app.get('/productDetails', async (req, res) => {

  const channelid = await runQuery('select channel_id from public."CHANNEL"');
  const products = await runQuery(` SELECT product_reference_id, public."PRODUCT2".sku, title, quantity, mrp, brand, colour, description, image_url1, image_url2, image_url3, image_url4, image_url5 from public."PRODUCT2" inner join public."STOCK" on public."PRODUCT2".sku=public."STOCK".sku `);
  
  products.rows.map(product=>{
      product['channel_id']=channelid.rows[0].channel_id
      
  })
  
  res.json(products.rows)
});

app.post('/saveOrder',  async (req, res) => {

try{
  
  const query1 = 'insert into public."SALES_ORDER" values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)'
  const values1 = [req.body.channel_id,req.body.channel_order_id,req.body.status,req.body.user_id,req.body.sold_price,req.body.remarks,req.body.customer_id,req.body.buyer_name,
    req.body.buyer_phone_number,req.body.recipient_name,req.body.shipping_address1,req.body.shipping_address2,req.body.shipping_address3,req.body.ship_city,
    req.body.ship_state,req.body.ship_postal_code,req.body.ship_country,req.body.ship_phone_number,req.body.payment_method,req.body.cod_collectible_amount,
    req.body.fulfilled_by,req.body.invoice_number,req.body.category,req.body.warehouse_id,req.body.ship_date]
  const result1 = await runQuery(query1, values1)

  const query2 = 'insert into public."SALES_ORDER_ITEM" values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)'
  const values2 = [req.body.sku,req.body.quantity,req.body.sales_order_id,req.body.channel_sku,req.body.order_item_status,req.body.sold_price,req.body.tax_rate,req.body.tax_type,
    req.body.tax_amount,req.body.item_price,req.body.item_tax,req.body.shipping_price,req.body.shipping_tax,req.body.item_name]
  const result2 = await runQuery(query2, values2)
    
  res.json({status:"ok"})
}
catch(e){
  res.json({status:"failed"})
}
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
