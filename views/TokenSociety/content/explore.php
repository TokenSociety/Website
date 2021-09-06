<div id="content">

    <!-- Outer container -->
    <div class="layout-container">

        <?php echo Q::tool('TokenSociety/featured', $featured) ?>
        <div class="tokensociety_market_place">
            <h2>Marketplace</h2>
            <?php echo Q::tool('TokenSociety/NFT/filter') ?>
        </div>


        <?php
            echo Q::tool("Streams/related", array(
                "publisherId" => Users::currentCommunityId(true),
                "streamName" => "TokenSociety/NFTs",
                "relationType" => "NFT",
				"editable" => false,
				"realtime" => true,
                "sortable" => false,
                "previewOptions" => array(
					"closeable" => false,
					"editable" => false
				)
            ));
        ?>

        <a href="#" class="loadmore">Load More</a>
    </div>

    <?php include "snippets/footer.php" ?>

</div>
