# Product images

Drop product photos here, **named by product slug**, then run:

```bash
cd apps/api
node scripts/set-product-images.mjs            # apply changes
node scripts/set-product-images.mjs --dry-run  # see what would happen first
```

Only files whose name matches a product slug are used; anything else
is reported at the end. `--dry-run` makes no changes.
