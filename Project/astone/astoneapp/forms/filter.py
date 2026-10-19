from django import forms

BRAND_CHOICES = [
    ('Uniqlo', 'Uniqlo'),
    ('Pull & Bear', 'Pull & Bear'),
    ('H&M', 'H&M'),
]

TYPE_CHOICES = [
    ('shirts', 'Shirts'),
    ('pants', 'Pants'),
    ('shorts', 'Shorts'),
    ('shoes', 'Shoes'),
    ('accessories', 'Accessories'),
    ('bags', 'Bags'),
]

PRICE_RANGE_CHOICES = [
    ('1-50', '$1-50'),
    ('51-100', '$51-100'),
]

SELLER_LOCATION_CHOICES = [
    ('Selangor', 'Selangor'),
    ('Sabah', 'Sabah'),
    ('Kuala Lumpur', 'Kuala Lumpur'),
]

class ProductFilter(forms.Form):
    brands = forms.MultipleChoiceField(choices=BRAND_CHOICES, required=False, widget=forms.CheckboxSelectMultiple)
    type = forms.MultipleChoiceField(choices=TYPE_CHOICES, required=False, widget=forms.CheckboxSelectMultiple)
    price_ranges = forms.MultipleChoiceField(choices=PRICE_RANGE_CHOICES, required=False, widget=forms.CheckboxSelectMultiple)
    seller_location = forms.MultipleChoiceField(choices=SELLER_LOCATION_CHOICES, required=False, widget=forms.CheckboxSelectMultiple)
