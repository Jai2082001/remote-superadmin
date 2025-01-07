import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const createDatabase = async (name, email, phone) => {
    const uri = `mongodb+srv://jaideeGrover:UBOwimNdbkRlrKKL@cluster0.wztcd.mongodb.net/${name}?retryWrites=true&w=majority`;

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();

        const database = client.db(name);
        const collection = database.collection('res_info');

        const result = await collection.insertOne({
            name: name,
            email: email,
            phone: phone
        });

        console.log('Database created and data inserted:', result);

        await client.close();
        return uri;
    } catch (error) {
        console.log(error);
        throw new Error(`Error creating database: ${error.message}`);
    }
};



// API route handler
export async function POST(req) {
    const { name, email, phone } = await req.json();

    if (!name || !email || !phone) {
        return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            { status: 400 }
        );
    }

    try {
        const uri = await createDatabase(name, email, phone);
        // return new Response(JSON.stringify({message: 'n'}), {status: 200})
        const response = await fetch('http://localhost:3000/api/create-backend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ resname: name, dburl: uri })
        });

        if(!response.ok){
            throw new Error('Failed to Fetch')
        }else{
            const data = await response.json();
            console.log(data)

            return new Response(JSON.stringify(data), {status: 200})
        }
    } catch (error) {
        console.log(error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}