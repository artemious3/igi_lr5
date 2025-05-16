from django.test import TestCase, Client
from django.contrib.auth import get_user_model

class LoadUnauthTest(TestCase):
    def setUp(self):
        # Every test needs a client.
        self.client = Client()

    # def test_home(self):
    #     response = self.client.get("/")
    #     self.assertEqual(response.status_code, 200)

    def test_stats(self):
        response = self.client.get("/stats/")
        self.assertEqual(response.status_code, 200)

    # def test_auth(self):
    #     response = self.client.get("/auth/login")
    #     self.assertEqual(response.status_code, 200)

    def test_news(self):
        response = self.client.get("/news/")
        self.assertEqual(response.status_code, 200)

    def test_review(self):
        response = self.client.get("/reviews/list")
        self.assertEqual(response.status_code, 200)

    def test_faq(self):
        response = self.client.get("/faq/")
        self.assertEqual(response.status_code, 200)

#
# class LoadClientTest(TestCase):
#     def setUp(self):
#         User = get_user_model()
#         user = User.objects.create('temporary', 'temporary@gmail.com', 'temporary')
#         self.client = Client()
#         self.client.force_login(user)
#
#     def test_(self):
#         response = self.client.get("/stats")
#         self.assertEqual(response.status_code, 200)
#
#     def test_stats_all(self):
#         response = self.client.get("/stats/plot/all")
#         self.assertEqual(response.status_code, 200)
#
#     def test_stats_user(self):
#         response = self.client.get("/stats/plot/user")
#         self.assertEqual(response.status_code, 200)
# Create your tests here.
