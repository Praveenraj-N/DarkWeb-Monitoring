backend

cd ~/Desktop/darkweb/backend
source venv/bin/activate

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

cd ~/Desktop/darkweb/backend
uvicorn app.main:app --reload


frontend 

npm run dev


For api and Login details adding
http://127.0.0.1:8000/docs
