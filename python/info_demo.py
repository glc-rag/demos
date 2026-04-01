#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GLC-RAG Info API Demo

This demo demonstrates how to use the GLC-RAG API's info endpoints:
- Login to get JWT token
- Create info items (admin)
- List info items (admin)
- Delete info items (admin)
- Query info using chat /info command

API Server: https://glc-rag.hu/
"""

import requests
import json
import time
import sys
import uuid
import io
import codecs

# Configure UTF-8 output
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Configuration - Replace with your actual credentials for testing
BASE_URL = "https://glc-rag.hu"
USER_ID = "dummy"
TENANT_ID = "dummy"
PASSWORD = "dummy"


class GLCInfoDemo:
    """Demo class for GLC-RAG Info API operations"""
    
    def __init__(self, base_url: str, user_id: str, tenant_id: str, password: str):
        self.base_url = base_url
        self.user_id = user_id
        self.tenant_id = tenant_id
        self.password = password
        self.token = None
        self.session = requests.Session()
    
    def login(self) -> str:
        """
        Perform login to get JWT token.
        
        Returns:
            str: JWT token string
            
        Raises:
            requests.HTTPError: If login fails
        """
        url = f"{self.base_url}/auth/login"
        payload = {
            "user_id": self.user_id,
            "tenant_id": self.tenant_id,
            "password": self.password
        }
        
        print("\n" + "="*60)
        print("STEP 1: Login")
        print("="*60)
        print(f"URL: {url}")
        print(f"Payload: {json.dumps(payload, ensure_ascii=False)}")
        
        response = self.session.post(url, json=payload)
        response.raise_for_status()
        
        data = response.json()
        self.token = data.get("access_token")
        
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(data, ensure_ascii=False)}")
        print(f"\n[OK] Login successful! Token: {self.token[:50]}...")
        
        return self.token
    
    def create_info(self, title: str, description: str, content: str, 
                    scope: str = "internal", is_active: bool = True) -> dict:
        """
        Create a new info item.
        
        Args:
            title: Title of the info item
            description: Description of the info item
            content: Content of the info item
            scope: "internal" or "public" (default: "internal")
            is_active: Whether the item is active (default: True)
            
        Returns:
            dict: Response containing id and message
        """
        url = f"{self.base_url}/admin/info"
        payload = {
            "title": title,
            "description": description,
            "content": content,
            "scope": scope,
            "is_active": is_active
        }
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        print("\n" + "="*60)
        print("STEP 2: Create Info")
        print("="*60)
        print(f"URL: {url}")
        print(f"Payload: {json.dumps(payload, ensure_ascii=False)}")
        
        response = self.session.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(data, ensure_ascii=False)}")
        print(f"\n[OK] Info created! ID: {data.get('id')}")
        
        return data
    
    def list_info(self, limit: int = 10, offset: int = 0, 
                  scope: str = None, status: str = None, 
                  search: str = None) -> dict:
        """
        List info items.
        
        Args:
            limit: Maximum number of items to return (default: 10)
            offset: Offset for pagination (default: 0)
            scope: Filter by scope ("internal" or "public")
            status: Filter by indexing status
            search: Search term
            
        Returns:
            dict: Response containing items and total count
        """
        url = f"{self.base_url}/admin/info"
        params = {
            "limit": limit,
            "offset": offset
        }
        if scope:
            params["scope"] = scope
        if status:
            params["status"] = status
        if search:
            params["search"] = search
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        print("\n" + "="*60)
        print("STEP 3: List Info Items")
        print("="*60)
        print(f"URL: {url}")
        print(f"Params: {params}")
        
        response = self.session.get(url, params=params, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        print(f"Status: {response.status_code}")
        print(f"Total items: {data.get('total', 0)}")
        
        items = data.get("items", [])
        print(f"\nFound {len(items)} info items:")
        for item in items:
            print(f"  - ID: {item.get('id')}")
            print(f"    Title: {item.get('title')}")
            print(f"    Description: {item.get('description', 'N/A')}")
            print(f"    Scope: {item.get('scope')}")
            print(f"    Status: {item.get('indexing_status')}")
            print(f"    Created: {item.get('created_at')}")
            print()
        
        return data
    
    def get_info(self, item_id: str) -> dict:
        """
        Get a specific info item by ID.
        
        Args:
            item_id: The ID of the info item
            
        Returns:
            dict: The info item details
        """
        url = f"{self.base_url}/admin/info/{item_id}"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        print("\n" + "="*60)
        print("STEP 4: Get Info Item")
        print("="*60)
        print(f"URL: {url}")
        
        response = self.session.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(data, ensure_ascii=False)}")
        
        return data
    
    def delete_info(self, item_id: str) -> dict:
        """
        Delete an info item.
        
        Args:
            item_id: The ID of the info item to delete
            
        Returns:
            dict: Response message
        """
        url = f"{self.base_url}/admin/info/{item_id}"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        print("\n" + "="*60)
        print("STEP 5: Delete Info Item")
        print("="*60)
        print(f"URL: {url}")
        
        response = self.session.delete(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(data, ensure_ascii=False)}")
        print(f"\n[OK] Info deleted!")
        
        return data
    
    def chat_info(self, question: str, session_id: str = None) -> dict:
        """
        Query info using the /info chat command.
        
        Args:
            question: The question to ask (with /info prefix)
            session_id: Optional session ID for the chat
            
        Returns:
            dict: Chat response
        """
        url = f"{self.base_url}/chat"
        if not session_id:
            session_id = str(uuid.uuid4())
            
        payload = {
            "channel": "internal",
            "text": f"/info {question}",
            "session_id": session_id
        }
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        print("\n" + "="*60)
        print("STEP 6: Chat /info Query")
        print("="*60)
        print(f"URL: {url}")
        print(f"Payload: {json.dumps(payload, ensure_ascii=False)}")
        
        response = self.session.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        print(f"Status: {response.status_code}")
        print(f"\nResponse:")
        print(f"  trace_id: {data.get('trace_id')}")
        print(f"  mode: {data.get('mode')}")
        print(f"  status_code: {data.get('status_code')}")
        
        # Handle potential encoding issues with response text
        text = data.get('text', '')
        print(f"  text: (length={len(text)})")
        print(f"  sources: {data.get('sources')}")
        
        return data
    
    def wait_for_indexing(self, item_id: str, timeout: int = 60, 
                          interval: int = 2) -> str:
        """
        Wait for an info item to be indexed.
        
        Args:
            item_id: The ID of the info item
            timeout: Maximum time to wait in seconds
            interval: Time between checks in seconds
            
        Returns:
            str: Final indexing status
        """
        print("\n" + "="*60)
        print("WAITING FOR INDEXING")
        print("="*60)
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            info = self.get_info(item_id)
            status = info.get("indexing_status")
            print(f"  Current status: {status}")
            
            if status == "INDEXED":
                print(f"[OK] Indexing complete!")
                return status
            elif status == "FAILED":
                print(f"[ERROR] Indexing failed!")
                return status
            
            time.sleep(interval)
        
        print(f"[ERROR] Timeout waiting for indexing!")
        return "TIMEOUT"


def main():
    """Main demo function"""
    
    # Initialize demo
    demo = GLCInfoDemo(BASE_URL, USER_ID, TENANT_ID, PASSWORD)
    
    try:
        # Step 1: Login
        demo.login()
        
        # Step 2: Create info item
        info_response = demo.create_info(
            title="Gyakori kerdesek",
            description="Regisztracio es bejelentkezes",
            content="""
Hogyan regisztralok?
A Regisztracio menupontbol kitoltod az urlapot es megerositened az email cimed.

Hogyan jelentkezek be?
A Bejelentkezes gombra kattintva add meg az email cimed es jelszavad.

Elfelejtettem a jelszavam, mit tegyek?
A Jelszo emlekezteto funkcional uj jelszot kerhetsz.
            """,
            scope="internal",
            is_active=True
        )
        
        info_id = info_response.get("id")
        
        # Step 3: Wait for indexing
        demo.wait_for_indexing(info_id)
        
        # Step 4: List info items
        demo.list_info(limit=5)
        
        # Step 5: Query info using chat
        demo.chat_info("Hogyan regisztralok?")
        
        # Step 6: Get specific info
        if info_id:
            demo.get_info(info_id)
        
        # Step 7: Delete info (cleanup)
        if info_id:
            demo.delete_info(info_id)
        
        print("\n" + "="*60)
        print("DEMO COMPLETED SUCCESSFULLY!")
        print("="*60)
        
    except requests.HTTPError as e:
        print(f"\n[ERROR] HTTP Error: {e}")
        print(f"Response: {e.response.text if e.response else 'No response'}")
        sys.exit(1)
    except requests.RequestException as e:
        print(f"\n[ERROR] Request Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
