from django.forms import ModelForm, ChoiceField, Select

from news import models
from .models import Review



class ReviewNewForm(ModelForm):
    def __init__(self, *args, **kvargs):
        self.user = kvargs.pop('user', None)
        super(ModelForm, self).__init__(*args, **kvargs)

    mark = ChoiceField(
            choices=[(i, str(i)) for i in range(1, 6)],  # Generates [(1, '1'), (2, '2'), ..., (5, '5')]
            widget=Select,
            label="Rating"
        )

    class Meta:
        model = Review
        fields = ("mark", "text")

    def save(self, commit=True):
        review = super().save(commit=False)
        review.user = self.user

        if commit:
            review.save()
        return review
